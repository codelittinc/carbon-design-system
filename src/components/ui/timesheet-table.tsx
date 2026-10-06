"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactElement } from "react";
import { cn } from "@/lib/cn";
import { eyebrowClass, tableRowHoverClass } from "@/lib/ui-classes";
import {
  WEEKDAY_LABELS,
  addDays,
  dateKey,
  datePart,
  daysInMonth,
  formatCalendarDate,
  formatDateKey,
  monthKey,
  monthLabel,
  parseDateKey,
  parseMonthKey,
  shiftMonth,
  startOfWeek,
  todayIn,
  type CalendarDate,
  type YearMonth,
} from "@/lib/calendar";
import {
  cellKey,
  contractCoversDay,
  createDefaultApi,
  diffGrids,
  parseCellKey,
  type TimesheetApi,
  type TimesheetContract,
  type TimesheetGridData,
  type TimesheetTimeOff,
  type TimesheetViewMode,
} from "@/lib/timesheet";
import { Alert } from "./alert";
import { Badge } from "./badge";
import { Button } from "./button";
import { PeriodNav } from "./calendar-chrome";
import { Card, CardHeader } from "./card";
import { PageHeader } from "./page-header";
import { Progress } from "./progress";
import { SegmentedControl } from "./segmented-control";
import { Spinner } from "./spinner";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "./table";
import { TableEmptyRow } from "./table-empty-row";
import { toast } from "./toast";
import {
  ContractName,
  DayDetailPanel,
  HoursInput,
  MonthlyCalendarGrid,
  dayLabel,
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
  /**
   * Overrides for any of the API methods; the rest use `createDefaultApi`.
   * Read on each call, so an inline object is fine: a new one never refetches.
   */
  api?: Partial<TimesheetApi>;
  /** Passed to `createDefaultApi`. Changing it refetches the period. */
  baseUrl?: string;
  /**
   * Passed to `createDefaultApi`, so they go on every default request. Read on
   * each call, like `api`.
   */
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

const VIEW_OPTIONS = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

/** Edits are saved this long after the last keystroke. */
const AUTOSAVE_DELAY_MS = 15000;
/** How long "Saved · Revert" stays up after a save. */
const REVERT_WINDOW_MS = 5000;

const headClass = cn(eyebrowClass, "px-2 py-3");

/** "Sep 14 – Sep 20, 2026". */
function weekRangeLabel(monday: CalendarDate): string {
  const sunday = addDays(monday, 6);
  return `${formatCalendarDate(monday, { month: "short", day: "numeric" })} – ${formatCalendarDate(sunday, { month: "short", day: "numeric", year: "numeric" })}`;
}

function monthOf(date: CalendarDate): YearMonth {
  return { year: date.year, month: date.month };
}

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
        <Progress
          aria-label="Hours logged of expected"
          value={percentage}
          tone={isOver ? "warning" : isComplete ? "success" : "error"}
        />
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
  // The latest props, read when a request is made. Callers pass `api`,
  // `apiHeaders` and `onNavigate` inline, so their identity changes on every
  // parent render; keyed on it, each render refetched and wiped the edits.
  const latest = useRef({ apiOverrides, baseUrl, apiHeaders, onNavigate });
  useLayoutEffect(() => {
    latest.current = { apiOverrides, baseUrl, apiHeaders, onNavigate };
  });

  // Stable, apart from `baseUrl`: a different server is a reason to refetch.
  const api = useMemo<TimesheetApi>(() => {
    const resolve = (): TimesheetApi => {
      const { apiOverrides: overrides, baseUrl: url, apiHeaders: headers } = latest.current;
      const defaultApi = createDefaultApi(url, headers);
      return {
        fetchTimeEntries: overrides?.fetchTimeEntries ?? defaultApi.fetchTimeEntries,
        fetchExpectedHours: overrides?.fetchExpectedHours ?? defaultApi.fetchExpectedHours,
        saveTimesheet: overrides?.saveTimesheet ?? defaultApi.saveTimesheet,
      };
    };
    return {
      fetchTimeEntries: (params) => resolve().fetchTimeEntries(params),
      fetchExpectedHours: (params) => resolve().fetchExpectedHours(params),
      saveTimesheet: (entries) => resolve().saveTimesheet(entries),
    };
    // baseUrl is read through `latest`; it is a dependency only to refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl]);

  const [viewMode, setViewMode] = useState<TimesheetViewMode>(defaultView);
  const [weekStart, setWeekStart] = useState<CalendarDate>(() =>
    startOfWeek((initialWeek && parseDateKey(initialWeek)) || todayIn()),
  );
  const [month, setMonth] = useState<YearMonth>(
    () => (initialMonth && parseMonthKey(initialMonth)) || monthOf(todayIn()),
  );
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

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekDates = weekDays.map(dateKey);
  const today = dateKey(todayIn());

  // The period on screen, as "YYYY-MM-DD" keys, both ends inclusive.
  const rangeStart = viewMode === "weekly" ? weekDates[0] : dateKey({ ...month, day: 1 });
  const rangeEnd =
    viewMode === "weekly"
      ? weekDates[6]
      : dateKey({ ...month, day: daysInMonth(month.year, month.month) });

  const activeContracts = contracts.filter(
    (c) => c.projectActive && datePart(c.startDate) <= rangeEnd && datePart(c.endDate) >= rangeStart,
  );

  const selectedDayContracts = selectedDay
    ? contracts.filter((c) => c.projectActive && contractCoversDay(c, selectedDay))
    : [];

  const isDirty = diffGrids(originalData, gridData).length > 0;

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
      const startDate = rangeStart;
      const endDate = rangeEnd;

      const [entriesRes, expectedRes] = await Promise.all([
        api.fetchTimeEntries({ userId, startDate, endDate }),
        api.fetchExpectedHours({ startDate, endDate }),
      ]);

      const newGrid: TimesheetGridData = {};
      for (const entry of entriesRes.timeEntries) {
        newGrid[cellKey(entry.contractId, datePart(entry.date))] = entry.hours;
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
  }, [rangeStart, rangeEnd, userId, api]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Tell the page which period is showing, so it can keep the URL in step.
  // Only when the period changes: a new `onNavigate` is not a navigation.
  useEffect(() => {
    latest.current.onNavigate?.(
      viewMode === "monthly"
        ? { view: "monthly", month: monthKey(month) }
        : { view: "weekly", week: dateKey(weekStart) },
    );
  }, [viewMode, weekStart, month]);

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
      const changedEntries = diffGrids(snapshotBefore, gridNow);
      if (changedEntries.length === 0) return false;
      await api.saveTimesheet(changedEntries);
      return true;
    },
    [api],
  );

  /**
   * Saves the edits. False when the save failed (its toast is up and the grid
   * stays dirty), so navigation can stay put instead of loading over them.
   */
  const performAutoSave = useCallback(async (): Promise<boolean> => {
    clearTimer(autoSaveTimerRef);
    const snapshotBefore = originalData;
    const gridNow = gridData;
    if (diffGrids(snapshotBefore, gridNow).length === 0) return true;
    setSaving(true);
    try {
      const saved = await persistDiff(snapshotBefore, gridNow);
      if (!saved) return true;
      setOriginalData({ ...gridNow });
      setRevertSnapshot(snapshotBefore);
      clearTimer(revertHideTimerRef);
      revertHideTimerRef.current = setTimeout(() => {
        setRevertSnapshot(null);
        revertHideTimerRef.current = null;
      }, REVERT_WINDOW_MS);
      return true;
    } catch (error: unknown) {
      console.error("Error auto-saving timesheet:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save timesheet");
      return false;
    } finally {
      setSaving(false);
    }
  }, [originalData, gridData, persistDiff]);

  /** Saves any edits first. False when that failed: stay on this period. */
  const flushPendingAutoSave = useCallback(async (): Promise<boolean> => {
    clearTimer(autoSaveTimerRef);
    return isDirty ? performAutoSave() : true;
  }, [isDirty, performAutoSave]);

  const handleRevert = useCallback(async () => {
    if (!revertSnapshot) return;
    const snapshot = revertSnapshot;
    setRevertSnapshot(null);
    clearTimer(revertHideTimerRef);
    clearTimer(autoSaveTimerRef);
    const currentSaved = originalData;
    setGridData(snapshot);
    setSaving(true);
    try {
      await persistDiff(currentSaved, snapshot);
      // Only now does the server have the snapshot. On a failure the grid
      // shows it unsaved, with Save, against what the server still has.
      setOriginalData(snapshot);
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

  const goToPrev = async () => {
    if (!(await flushPendingAutoSave())) return;
    if (viewMode === "weekly") {
      setWeekStart((prev) => addDays(prev, -7));
    } else {
      setSelectedDay(null);
      setMonth((prev) => shiftMonth(prev, -1));
    }
  };
  const goToNext = async () => {
    if (!(await flushPendingAutoSave())) return;
    if (viewMode === "weekly") {
      setWeekStart((prev) => addDays(prev, 7));
    } else {
      setSelectedDay(null);
      setMonth((prev) => shiftMonth(prev, 1));
    }
  };
  const goToToday = async () => {
    if (!(await flushPendingAutoSave())) return;
    if (viewMode === "weekly") {
      setWeekStart(startOfWeek(todayIn()));
    } else {
      setSelectedDay(null);
      setMonth(monthOf(todayIn()));
    }
  };

  const handleViewModeChange = async (mode: TimesheetViewMode) => {
    if (mode === viewMode) return;
    if (!(await flushPendingAutoSave())) return;
    if (mode === "monthly") {
      setMonth(monthOf(weekStart));
      setSelectedDay(null);
    } else {
      setWeekStart(startOfWeek({ ...month, day: 1 }));
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
      e.currentTarget.selectionEnd === e.currentTarget.value.length
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

      <PeriodNav
        label={viewMode === "weekly" ? weekRangeLabel(weekStart) : monthLabel(month)}
        onPrevious={goToPrev}
        onNext={goToNext}
        onToday={goToToday}
        previousLabel={viewMode === "weekly" ? "Previous week" : "Previous month"}
        nextLabel={viewMode === "weekly" ? "Next week" : "Next month"}
      />

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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={cn(headClass, "min-w-[200px] px-3 text-left text-text-muted")}>
                        Contract
                      </TableHead>
                      {weekDates.map((date, i) => (
                        <TableHead
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
                          <div>{WEEKDAY_LABELS[i]}</div>
                          <div className="mt-0.5 text-[10px] font-normal normal-case">
                            {formatCalendarDate(weekDays[i], { month: "short", day: "numeric" })}
                          </div>
                        </TableHead>
                      ))}
                      <TableHead className={cn(headClass, "w-[70px] text-center text-text-muted")}>
                        Total
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeContracts.length === 0 && (
                      <TableEmptyRow colSpan={9}>No active contracts for this week.</TableEmptyRow>
                    )}
                    {activeContracts.map((contract, contractIdx) => {
                      const rowTotal = getRowTotal(contract.id);
                      return (
                        <TableRow key={contract.id} className={tableRowHoverClass}>
                          <TableCell>
                            <ContractName contract={contract} />
                          </TableCell>
                          {weekDates.map((date, dayIdx) => {
                            const key = cellKey(contract.id, date);
                            const value = gridData[key];
                            const isOutside = !contractCoversDay(contract, date);
                            return (
                              <TableCell
                                key={date}
                                className={cn("px-1 py-2", date === today && "bg-accent-muted")}
                              >
                                <HoursInput
                                  ref={(el) => {
                                    inputRefs.current[key] = el;
                                  }}
                                  aria-label={`Hours for ${contract.projectName} on ${dayLabel(date)}`}
                                  value={value}
                                  disabled={isOutside}
                                  onValueChange={(next) => handleCellChange(contract.id, date, next)}
                                  onKeyDown={(e) => handleKeyDown(e, contractIdx, dayIdx)}
                                  placeholder={isOutside ? "" : "–"}
                                  className={cn(dayIdx >= 5 && !value && "bg-surface")}
                                />
                              </TableCell>
                            );
                          })}
                          <TableCell
                            className={cn(
                              "px-2 py-2 text-center font-medium tabular-nums",
                              rowTotal > 0 ? "text-text-primary" : "text-text-faint",
                            )}
                          >
                            {rowTotal > 0 ? rowTotal : "–"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell className={cn(eyebrowClass, "px-3 py-3")}>Daily Total</TableCell>
                      {weekDates.map((date) => {
                        const colTotal = getColumnTotal(date);
                        const isOver = colTotal > 24;
                        return (
                          <TableCell
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
                          </TableCell>
                        );
                      })}
                      <TableCell className="px-2 py-3 text-center font-bold tabular-nums text-text-primary">
                        {grandTotal > 0 ? grandTotal : "–"}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </Card>
          ) : (
            <>
              <MonthlyCalendarGrid
                month={month}
                gridData={gridData}
                contracts={activeContracts}
                timeOffs={timeOffs}
                today={today}
                selectedDay={selectedDay}
                onDaySelect={setSelectedDay}
                onClose={() => setSelectedDay(null)}
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
  const fmt = (iso: string) => formatDateKey(iso, { weekday: "short", month: "short", day: "numeric" });
  return (
    <Card padding="sm">
      <CardHeader
        size="sm"
        className="mb-0 px-3 pb-3 pt-2"
        title={`Time off this ${viewMode === "weekly" ? "week" : "month"}`}
      />
      <Table>
        <TableHeader>
          <TableRow>
            {["Type", "From", "To"].map((h) => (
              <TableHead key={h}>{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {timeOffs.map((to) => (
            <TableRow key={to.id} className="last:border-0">
              <TableCell className="text-text-primary">{to.type}</TableCell>
              <TableCell className="text-text-secondary">{fmt(to.startsAt)}</TableCell>
              <TableCell className="text-text-secondary">{fmt(to.endsAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
