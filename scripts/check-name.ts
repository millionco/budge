import validate from "validate-npm-package-name";
import whois from "whois-json";

const name = process.argv[2];

if (!name) {
  console.error("Usage: tsx scripts/check-name.ts <name>");
  console.error("  e.g. tsx scripts/check-name.ts my-cool-lib");
  process.exit(1);
}

const validation = validate(name);
if (!validation.validForNewPackages) {
  console.error(`\n  "${name}" is not a valid npm package name:`);
  for (const error of [...(validation.errors ?? []), ...(validation.warnings ?? [])]) {
    console.error(`    - ${error}`);
  }
  console.log();
  process.exit(1);
}

const checkNpmPackage = async (packageName: string): Promise<boolean> => {
  const response = await fetch(`https://registry.npmjs.org/${packageName}`);
  return response.status === 404;
};

const checkDomain = async (domain: string): Promise<boolean> => {
  try {
    const result = await whois(domain);
    const status = Array.isArray(result) ? result[0] : result;
    return !status?.domainName;
  } catch {
    return true;
  }
};

const extensions = [".com", ".dev", ".io", ".org", ".sh"];

const [npmAvailable, ...domainResults] = await Promise.all([
  checkNpmPackage(name),
  ...extensions.map(async (extension) => ({
    domain: `${name}${extension}`,
    available: await checkDomain(`${name}${extension}`),
  })),
]);

console.log(`\n  npm package: ${name}`);
console.log(`  ${npmAvailable ? "✓ available" : "✗ taken"}\n`);

console.log("  domains:");
for (const { domain, available } of domainResults) {
  console.log(`  ${available ? "✓" : "✗"} ${domain} — ${available ? "available" : "taken"}`);
}
console.log();
