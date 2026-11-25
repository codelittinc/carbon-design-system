// tsup 9 calls the TypeScript compiler API (`ts.parseJsonConfigFileContent`)
// from its own code, and TypeScript 7 no longer ships that API. The project
// typechecks with TypeScript 7 (`tsc`), so tsup alone gets the official TS 6
// compatibility build as its `typescript`. A peer always resolves from the
// root, so the peer is turned into a dependency here; an override can't do it.
// Remove this once tsup supports TypeScript 7 itself.
function readPackage(pkg) {
  if (pkg.name === "tsup") {
    delete pkg.peerDependencies?.typescript;
    delete pkg.peerDependenciesMeta?.typescript;
    pkg.dependencies = { ...pkg.dependencies, typescript: "npm:@typescript/typescript6@^6.0.2" };
  }
  return pkg;
}

module.exports = { hooks: { readPackage } };
