const expected = "22.14.0";
const actual = process.versions.node;
if (actual !== expected) {
  console.error(
    `Unsupported Node runtime: ${actual}. Release verification requires Node ${expected}.`,
  );
  process.exit(1);
}
console.log(`Node runtime OK: ${actual}`);
