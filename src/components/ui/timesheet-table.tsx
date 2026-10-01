"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  addDays,
  cellKey,
  contractCoversDay,
  createDefaultApi,
  formatMonthYear,
  formatShortDate,
  formatWeekRange,
  getFirstOfMonth,
  getLastOfMonth,
  getMonday,
  parseCellKey,
  parseUTCDate,
  toISODate,
  type TimesheetApi,
  type TimesheetContract,
  type TimesheetEntry,
  type TimesheetGridData,
  type TimesheetTimeOff,
  type TimesheetViewMode,
} from "@/lib/timesheet";
import { Alert } from "./alert";
import { Badge } from "./badge";
import { Button } from "./button";
import { Card } from "./card";
import { Input } from "./input";
import { PageHeader } from "./page-header";
import { SegmentedControl } from "./segmented-control";
import { Spinner } from "./spinner";
import { toast } from "./toast";
import {
  ContractName,
  DayDetailPanel,
  MonthlyCalendarGrid,
  dayLabel,
  hoursInputClass,
} from "./timesheet-month";

export {
  createDefaultApi,
  type ExpectedHoursResponse,
  type SaveResponse,
  type TimeEntryResponse,
  type TimesheetApi,
  type TimesheetContract,
  type TimesheetEntry,
  type TimesheetGridData,
  type TimesheetTimeOff,
  type TimesheetViewMode,
} from "@/lib/timesheet";

export interface TimesheetTableProps {
  userId: number;
  userFullName: string;
  contracts: TimesheetContract[];
  /** Overrides for any of the API methods; the rest use `createDefaultApi`. */
  api?: Partial<TimesheetApi>;
  /** Passed to `createDefaultApi`. */
  baseUrl?: string;
  /** Passed to `createDefaultApi`, so they go on every default request. */
  apiHeaders?: Record<string, string>;
  defaultView?: TimesheetViewMode;
  onViewChange?: (view: TimesheetViewMode) => void;
  /**
   * Called with `{ view, week }` or `{ view, month }` whenever the period
   * shown changes — on mount too — so the page can mirror it in the URL.
   */
  onNavigate?: (params: Record<string, string>) => void;
  /** YYYY-MM-DD; the week containing it is shown first. */
  initialWeek?: string;
  /** YYYY-MM. */
  initialMonth?: string;
  title?: string;
  className?: string;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const VIEW_OPTIONS = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

/** Edits are saved this long after the last keystroke. */
const AUTOSAVE_DELAY_MS = 15000;
/** How long "Saved · Revert" stays up after a save. */
const REVERT_WINDOW_MS = 5000;

const headClass = "px-2 py-3 text-xs font-medium uppercase tracking-wider";

function HoursSummary({
  loggedHours,
  expectedHours,
  ptoHours,
}: {
  loggedHours: number;
  expectedHours: number;
  ptoHours: number;
}): ReactElement {
  const hasExpected = expectedHours > 0;
  const percentage = hasExpected ? Math.min((loggedHours / expectedHours) * 100, 100) : 0;
  const isComplete = hasExpected && loggedHours >= expectedHours;
  const isOver = hasExpected && loggedHours > expectedHours;

  return (
    <Card padding="md">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-text-secondary">
          <span className="font-semibold tabular-nums text-text-primary">{loggedHours}h</span> of{" "}
          <span className="font-semibold tabular-nums text-text-primary">{expectedHours}h</span>{" "}
          expected
        </p>
        <div className="flex items-center gap-2">
          {ptoHours > 0 && <Badge variant="info">{ptoHours}h time off</Badge>}
          {hasExpected &&
            (isOver ? (
              <Badge variant="warning">+{loggedHours - expectedHours}h over</Badge>
            ) : isComplete ? (
              <Badge variant="success">Complete</Badge>
            ) : (
              <Badge>{Math.max(0, expectedHours - loggedHours)}h remaining</Badge>
            ))}
        </div>
      </div>
      {hasExpected && (
        <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-surface-overlay">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isOver ? "bg-warning" : isComplete ? "bg-success" : "bg-error",
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </Card>
  );
}

/**
 * A person's timesheet: hours per contract per day, in a weekly grid or a
 * monthly calendar, with expected hours and time off from the API.
 *
 * Edits save themselves 15 seconds after the last change, or straight away
 * with Save, on navigation, or on switching view. Only the changed cells are
 * sent. After a save, "Revert" puts the previous values back for 5 seconds.
 *
 * Data comes from `api`; any method not given falls back to
 * `createDefaultApi(baseUrl, apiHeaders)`, which calls the `/api/my-timesheets`
 * routes. A failed load shows inline with a retry and a failed save as an
 * error toast — mount a `ToastProvider` to see it.
 */
export function TimesheetTable({
  userId,
  userFullName,
  contracts,
  api: apiOverrides,
  baseUrl = "",
  apiHeaders,
  defaultView = "weekly",
  onViewChange,
  onNavigate,
  initialWeek,
  initialMonth,
  title = "My Timesheets",
  className,
}: TimesheetTableProps): ReactElement {
  const api = useMemo<TimesheetApi>(() => {
    const defaultApi = createDefaultApi(baseUrl, apiHeaders);
    return {
      fetchTimeEntries: apiOverrides?.fetchTimeEntries ?? defaultApi.fetchTimeEntries,
      fetchExpectedHours: apiOverrides?.fetchExpectedHours ?? defaultApi.fetchExpectedHours,
      saveTimesheet: apiOverrides?.saveTimesheet ?? defaultApi.saveTimesheet,
    };
  }, [apiOverrides, baseUrl, apiHeaders]);

  const [viewMode, setViewMode] = useState<TimesheetViewMode>(defaultView);
  const [weekStart, setWeekStart] = useState<Date>(() => {
    if (initialWeek) {
      const parsed = parseUTCDate(initialWeek);
      if (!isNaN(parsed.getTime())) return getMonday(parsed);
    }
    return getMonday(new Date());
  });
  const [monthDate, setMonthDate] = useState<Date>(() => {
    if (initialMonth) {
      const parsed = parseUTCDate(initialMonth + "-01");
      if (!isNaN(parsed.getTime())) return getFirstOfMonth(parsed);
    }
    return getFirstOfMonth(new Date());
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [gridData, setGridData] = useState<TimesheetGridData>({});
  const [originalData, setOriginalData] = useState<TimesheetGridData>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expectedHours, setExpectedHours] = useState<number | null>(null);
  const [ptoHours, setPtoHours] = useState<number>(0);
  const [timeOffs, setTimeOffs] = useState<TimesheetTimeOff[]>([]);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [revertSnapshot, setRevertSnapshot] = useState<TimesheetGridData | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revertHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const weekDates = Array.from({ length: 7 }, (_, i) => toISODate(addDays(weekStart, i)));
  const weekEnd = addDays(weekStart, 6);
  const today = toISODate(new Date());

  const rangeStart = viewMode === "weekly" ? weekStart : getFirstOfMonth(monthDate);
  const rangeEnd = viewMode === "weekly" ? weekEnd : getLastOfMonth(monthDate);

  const activeContracts = contracts.filter((c) => {
    if (!c.projectActive) return false;
    return new Date(c.startDate) <= rangeEnd && new Date(c.endDate) >= rangeStart;
  });

  const selectedDayContracts = selectedDay
    ? contracts.filter((c) => c.projectActive && contractCoversDay(c, selectedDay))
    : [];

  const isDirty = JSON.stringify(gridData) !== JSON.stringify(originalData);

  const clearTimer = (ref: React.RefObject<ReturnType<typeof setTimeout> | null>) => {
    if (ref.current) {
      clearTimeout(ref.current);
      ref.current = null;
    }
  };

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const start = viewMode === "weekly" ? weekStart : getFirstOfMonth(monthDate);
      const end = viewMode === "weekly" ? addDays(weekStart, 6) : getLastOfMonth(monthDate);
      const startDate = toISODate(start);
      const endDate = toISODate(end);

      const [entriesRes, expectedRes] = await Promise.all([
        api.fetchTimeEntries({ userId, startDate, endDate }),
        api.fetchExpectedHours({ startDate, endDate }),
      ]);

      const newGrid: TimesheetGridData = {};
      for (const entry of entriesRes.timeEntries) {
        newGrid[cellKey(entry.contractId, entry.date.split("T")[0])] = entry.hours;
      }

      setGridData(newGrid);
      setOriginalData(newGrid);
      setExpectedHours(expectedRes.expectedHours);
      setPtoHours(expectedRes.ptoHours);
      setTimeOffs(expectedRes.timeOffs || []);
      setRevertSnapshot(null);
      clearTimer(autoSaveTimerRef);
      clearTimer(revertHideTimerRef);
    } catch (error) {
      console.error("Error fetching time entries:", error);
      setLoadError(true);
      toast.error("Failed to load time entries");
    } finally {
      setLoading(false);
    }
  }, [viewMode, weekStart, monthDate, userId, api]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Tell the page which period is showing, so it can keep the URL in step.
  useEffect(() => {
    if (!onNavigate) return;
    const params: Record<string, string> =
      viewMode === "monthly"
        ? { view: "monthly", month: toISODate(monthDate).slice(0, 7) }
        : { view: "weekly", week: toISODate(weekStart) };
    onNavigate(params);
  }, [viewMode, weekStart, monthDate, onNavigate]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Empty clears the cell; anything outside 0–24 is ignored.
  const handleCellChange = (contractId: number, date: string, value: string) => {
    const key = cellKey(contractId, date);
    if (value === "" || value === null) {
      setGridData((prev) => ({ ...prev, [key]: null }));
    } else {
      const num = parseFloat(value);
      if (!isNaN(num) && num >= 0 && num <= 24) {
        setGridData((prev) => ({ ...prev, [key]: num }));
      }
    }
  };

  /** Sends the cells that differ between the two grids. False when none do. */
  const persistDiff = useCallback(
    async (snapshotBefore: TimesheetGridData, gridNow: TimesheetGridData): Promise<boolean> => {
      const changedEntries: TimesheetEntry[] = [];
      const allKeys = new Set([...Object.keys(gridNow), ...Object.keys(snapshotBefore)]);
      for (const key of allKeys) {
        const currentVal = gridNow[key] ?? null;
        if (currentVal !== (snapshotBefore[key] ?? null)) {
          const { contractId, date } = parseCellKey(key);
          changedEntries.push({ contractId, date, hours: currentVal });
        }
      }
      if (changedEntries.length === 0) return false;
      await api.saveTimesheet(changedEntries);
      return true;
    },
    [api],
  );

  const performAutoSave = useCallback(async () => {
    clearTimer(autoSaveTimerRef);
    const snapshotBefore = originalData;
    const gridNow = gridData;
    if (JSON.stringify(gridNow) === JSON.stringify(snapshotBefore)) return;
    setSaving(true);
    try {
      const saved = await persistDiff(snapshotBefore, gridNow);
      if (!saved) return;
      setOriginalData({ ...gridNow });
      setRevertSnapshot(snapshotBefore);
      clearTimer(revertHideTimerRef);
      revertHideTimerRef.current = setTimeout(() => {
        setRevertSnapshot(null);
        revertHideTimerRef.current = null;
      }, REVERT_WINDOW_MS);
    } catch (error: unknown) {
      console.error("Error auto-saving timesheet:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save timesheet");
    } finally {
      setSaving(false);
    }
  }, [originalData, gridData, persistDiff]);

  const flushPendingAutoSave = useCallback(async () => {
    clearTimer(autoSaveTimerRef);
    if (isDirty) await performAutoSave();
  }, [isDirty, performAutoSave]);

  const handleRevert = useCallback(async () => {
    if (!revertSnapshot) return;
    const snapshot = revertSnapshot;
    setRevertSnapshot(null);
    clearTimer(revertHideTimerRef);
    clearTimer(autoSaveTimerRef);
    const currentSaved = originalData;
    setGridData(snapshot);
    setOriginalData(snapshot);
    setSaving(true);
    try {
      await persistDiff(currentSaved, snapshot);
    } catch (error: unknown) {
      console.error("Error reverting timesheet:", error);
      toast.error(error instanceof Error ? error.message : "Failed to revert changes");
    } finally {
      setSaving(false);
    }
  }, [revertSnapshot, originalData, persistDiff]);

  // Debounced auto-save: every edit restarts the timer, and editing again
  // hides the revert offer for the previous save.
  useEffect(() => {
    if (!isDirty || loading || saving) return;
    if (revertSnapshot) {
      setRevertSnapshot(null);
      clearTimer(revertHideTimerRef);
    }
    clearTimer(autoSaveTimerRef);
    autoSaveTimerRef.current = setTimeout(() => {
      autoSaveTimerRef.current = null;
      performAutoSave();
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimer(autoSaveTimerRef);
  }, [gridData, isDirty, loading, saving, performAutoSave, revertSnapshot]);

  useEffect(() => {
    return () => {
      clearTimer(autoSaveTimerRef);
      clearTimer(revertHideTimerRef);
    };
  }, []);

  const getRowTotal = (contractId: number): number =>
    weekDates.reduce((sum, date) => sum + (gridData[cellKey(contractId, date)] || 0), 0);

  const getColumnTotal = (date: string): number =>
    activeContracts.reduce((sum, c) => sum + (gridData[cellKey(c.id, date)] || 0), 0);

  const getGrandTotal = (): number => {
    if (viewMode === "weekly") {
      return activeContracts.reduce((sum, c) => sum + getRowTotal(c.id), 0);
    }
    return Object.entries(gridData).reduce((sum, [key, val]) => {
      const { contractId } = parseCellKey(key);
      return activeContracts.some((c) => c.id === contractId) ? sum + (val || 0) : sum;
    }, 0);
  };

  const shiftMonth = (step: number) => (prev: Date) =>
    new Date(Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth() + step, 1));

  const goToPrev = async () => {
    await flushPendingAutoSave();
    if (viewMode === "weekly") {
      setWeekStart((prev) => addDays(prev, -7));
    } else {
      setSelectedDay(null);
      setMonthDate(shiftMonth(-1));
    }
  };
  const goToNext = async () => {
    await flushPendingAutoSave();
    if (viewMode === "weekly") {
      setWeekStart((prev) => addDays(prev, 7));
    } else {
      setSelectedDay(null);
      setMonthDate(shiftMonth(1));
    }
  };
  const goToToday = async () => {
    await flushPendingAutoSave();
    if (viewMode === "weekly") {
      setWeekStart(getMonday(new Date()));
    } else {
      setSelectedDay(null);
      setMonthDate(getFirstOfMonth(new Date()));
    }
  };

  const handleViewModeChange = async (mode: TimesheetViewMode) => {
    if (mode === viewMode) return;
    await flushPendingAutoSave();
    if (mode === "monthly") {
      setMonthDate(getFirstOfMonth(weekStart));
      setSelectedDay(null);
    } else {
      setWeekStart(getMonday(monthDate));
    }
    setViewMode(mode);
    onViewChange?.(mode);
  };

  // Arrows move between cells (Left/Right only from the input's edge, so the
  // caret can still move inside a value); Enter moves down.
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    contractIdx: number,
    dayIdx: number,
  ) => {
    let targetContract = contractIdx;
    let targetDay = dayIdx;

    if (e.key === "ArrowUp") {
      targetContract = Math.max(0, contractIdx - 1);
    } else if (e.key === "ArrowDown" || e.key === "Enter") {
      targetContract = Math.min(activeContracts.length - 1, contractIdx + 1);
    } else if (e.key === "ArrowLeft" && e.currentTarget.selectionStart === 0) {
      targetDay = Math.max(0, dayIdx - 1);
    } else if (
      e.key === "ArrowRight" &&
      e.currentTarget.selectionStart === e.currentTarget.value.length
    ) {
      targetDay = Math.min(6, dayIdx + 1);
    } else {
      return;
    }
    e.preventDefault();

    const target = inputRefs.current[cellKey(activeContracts[targetContract].id, weekDates[targetDay])];
    target?.focus();
    target?.select();
  };

  const grandTotal = getGrandTotal();
  const showRevert = revertSnapshot && !isDirty && !saving;

  return (
    <div className={cn("space-y-6", className)}>
      <PageHeader
        className="mb-0"
        title={title}
        description={userFullName}
        actions={
          <>
            <SegmentedControl
              aria-label="View"
              options={VIEW_OPTIONS}
              value={viewMode}
              onChange={(v) => handleViewModeChange(v as TimesheetViewMode)}
            />
            {showRevert ? (
              <>
                <span role="status" className="text-sm font-medium text-success-text">
                  Saved
                </span>
                <Button type="button" variant="outline" size="sm" onClick={handleRevert}>
                  Revert
                </Button>
              </>
            ) : isDirty || saving ? (
              <Button type="button" onClick={performAutoSave} disabled={saving || !isDirty}>
                {saving ? "Saving..." : "Save"}
              </Button>
            ) : null}
          </>
        }
      />

      <Card padding="sm">
        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" size="sm" onClick={goToPrev}>
            <ChevronLeft size={14} aria-hidden="true" />
            Prev
          </Button>
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <span className="text-sm font-medium text-text-primary">
              {viewMode === "weekly" ? formatWeekRange(weekStart) : formatMonthYear(monthDate)}
            </span>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={goToNext}>
            Next
            <ChevronRight size={14} aria-hidden="true" />
          </Button>
        </div>
      </Card>

      {loading ? (
        <Spinner label="Loading timesheet..." className="py-12" />
      ) : loadError ? (
        <Alert variant="error" title="Failed to load time entries">
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={fetchEntries}>
            Try again
          </Button>
        </Alert>
      ) : (
        <>
          <HoursSummary
            loggedHours={grandTotal}
            expectedHours={expectedHours ?? 0}
            ptoHours={ptoHours}
          />

          {viewMode === "weekly" ? (
            <Card padding="sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className={cn(headClass, "min-w-[200px] px-3 text-left text-text-muted")}>
                        Contract
                      </th>
                      {weekDates.map((date, i) => (
                        <th
                          key={date}
                          className={cn(
                            headClass,
                            "w-[90px] text-center",
                            date === today
                              ? "bg-accent-muted text-accent-text"
                              : i >= 5
                                ? "text-text-faint"
                                : "text-text-muted",
                          )}
                        >
                          <div>{DAY_LABELS[i]}</div>
                          <div className="mt-0.5 text-[10px] font-normal normal-case">
                            {formatShortDate(addDays(weekStart, i))}
                          </div>
                        </th>
                      ))}
                      <th className={cn(headClass, "w-[70px] text-center text-text-muted")}>
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeContracts.length === 0 && (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-text-muted">
                          No active contracts for this week.
                        </td>
                      </tr>
                    )}
                    {activeContracts.map((contract, contractIdx) => {
                      const rowTotal = getRowTotal(contract.id);
                      return (
                        <tr
                          key={contract.id}
                          className="border-b border-border-subtle hover:bg-table-row-hover"
                        >
                          <td className="px-3 py-2">
                            <ContractName contract={contract} />
                          </td>
                          {weekDates.map((date, dayIdx) => {
                            const key = cellKey(contract.id, date);
                            const value = gridData[key];
                            const isOutside = !contractCoversDay(contract, date);
                            return (
                              <td
                                key={date}
                                className={cn("px-1 py-2", date === today && "bg-accent-muted")}
                              >
                                <Input
                                  ref={(el) => {
                                    inputRefs.current[key] = el;
                                  }}
                                  type="number"
                                  step="0.25"
                                  min="0"
                                  max="24"
                                  aria-label={`Hours for ${contract.projectName} on ${dayLabel(date)}`}
                                  value={value ?? ""}
                                  disabled={isOutside}
                                  onChange={(e) => handleCellChange(contract.id, date, e.target.value)}
                                  onFocus={(e) => e.target.select()}
                                  onKeyDown={(e) => handleKeyDown(e, contractIdx, dayIdx)}
                                  placeholder={isOutside ? "" : "–"}
                                  className={cn(
                                    hoursInputClass,
                                    dayIdx >= 5 && !value && "bg-surface",
                                  )}
                                />
                              </td>
                            );
                          })}
                          <td
                            className={cn(
                              "px-2 py-2 text-center font-medium tabular-nums",
                              rowTotal > 0 ? "text-text-primary" : "text-text-faint",
                            )}
                          >
                            {rowTotal > 0 ? rowTotal : "–"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border">
                      <td className="px-3 py-3 text-xs font-medium uppercase text-text-muted">
                        Daily Total
                      </td>
                      {weekDates.map((date) => {
                        const colTotal = getColumnTotal(date);
                        const isOver = colTotal > 24;
                        return (
                          <td
                            key={date}
                            className={cn(
                              "px-2 py-3 text-center font-semibold tabular-nums",
                              date === today && "bg-accent-muted",
                              isOver
                                ? "text-accent-text"
                                : colTotal > 0
                                  ? "text-text-primary"
                                  : "text-text-faint",
                            )}
                            title={isOver ? "More than 24 hours in a day" : undefined}
                          >
                            {colTotal > 0 ? colTotal : "–"}
                            {isOver && " !"}
                          </td>
                        );
                      })}
                      <td className="px-2 py-3 text-center font-bold tabular-nums text-text-primary">
                        {grandTotal > 0 ? grandTotal : "–"}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>
          ) : (
            <>
              <MonthlyCalendarGrid
                monthDate={monthDate}
                gridData={gridData}
                contracts={activeContracts}
                timeOffs={timeOffs}
                today={today}
                selectedDay={selectedDay}
                onDaySelect={setSelectedDay}
                onCellChange={handleCellChange}
              />
              {selectedDay && selectedDayContracts.length > 1 && (
                <DayDetailPanel
                  selectedDay={selectedDay}
                  contracts={selectedDayContracts}
                  gridData={gridData}
                  onCellChange={handleCellChange}
                  onClose={() => setSelectedDay(null)}
                />
              )}
            </>
          )}

          {timeOffs.length > 0 && <TimeOffList timeOffs={timeOffs} viewMode={viewMode} />}
        </>
      )}
    </div>
  );
}

function TimeOffList({
  timeOffs,
  viewMode,
}: {
  timeOffs: TimesheetTimeOff[];
  viewMode: TimesheetViewMode;
}): ReactElement {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  return (
    <Card padding="sm">
      <h2 className="px-3 pb-3 pt-2 text-xs font-medium uppercase tracking-wider text-text-muted">
        Time Off This {viewMode === "weekly" ? "Week" : "Month"}
      </h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {["Type", "From", "To"].map((h) => (
              <th
                key={h}
                className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-text-muted"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeOffs.map((to) => (
            <tr key={to.id} className="border-b border-border-subtle last:border-0">
              <td className="px-3 py-2 text-text-primary">{to.type}</td>
              <td className="px-3 py-2 text-text-secondary">{fmt(to.startsAt)}</td>
              <td className="px-3 py-2 text-text-secondary">{fmt(to.endsAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
