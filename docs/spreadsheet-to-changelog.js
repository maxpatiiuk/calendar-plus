/**
 * Convert a "Living Requirements Spec" Spreadsheet (as a TSV file) into a
 * Markdown changelog with tables.
 *
 * Prerequisites:
 * ```bash
 * npm i papaparse
 * ```
 * Export the spreadsheet as a TSV file and save it as `in.tsv` in current
 * directory.
 * Execute this script with `node spreadsheet-to-changelog.js > ../CHANGELOG.md`
 */

const fs = require("fs");
const parse = require("papaparse");
const raw = fs.readFileSync("in.tsv", "utf8");
const {
  data: parsed,
  meta: { fields },
} = parse.parse(raw, { header: true });
const group = (entries) =>
  Array.from(
    entries
      .reduce(
        (grouped, [key, value]) =>
          grouped.set(key, [...(grouped.get(key) ?? []), value]),
        new Map(),
      )
      .entries(),
  );

const assignees = new Set(parsed.map((data) => data["Assignee"]));

const assigneeMapper = {
  Max: "maxpatiiuk",
  Will: "Durbatuluk1701",
  Jet: "jetsemr",
  Jacob: "jakeangus",
};

const columns = {
  "Requirement #": undefined,
  "Description of Requirement": "Name",
  "Story Points": "",
  Priority: "",
  "Spring #": undefined,
  Assignee: "",
  "GitHub Issue": "",
  Completed: "",
  "Pull Request": "",
  Merged: "",
  Artifacts: "Description",
};
const headerString = `<tr>\n${fields
  .filter((field) => columns[field] !== undefined)
  .map((field) => `\t\t\t<th>${columns[field] || field}</th>`)
  .join("\n")}\n\t\t</tr>`;

const githubLink = (type) => (value) =>
  value === "" || value === "N/A"
    ? ""
    : value
        .split(" and ")
        .map((value) => value.slice(value.lastIndexOf("/") + 1))
        .map(
          (number) =>
            `<a href="https://github.com/maxpatiiuk/calendar-plus/${type}/${number}">#${number}</a>`,
        )
        .join(" and ");

const columnFormatter = {
  Assignee: (value) =>
    value === ""
      ? ""
      : `<a href="https://github.com/${assigneeMapper[value]}">${assigneeMapper[value]}</a>`,
  "GitHub Issue": githubLink("issues"),
  Completed: (value) => value || "No",
  Merged: (value) => value || "No",
  "Pull Request": githubLink("pull"),
};

const grouped = group(parsed.map((data) => [data["Sprint #"], data]));
const formatted = grouped
  .reverse()
  .flatMap(([groupName, items]) => [
    `## Sprint #${groupName}`,
    `<table>\n\t<thead>\n\t\t${headerString}\n\t</thead>\n\t<tbody>\n${items
      .map(formatItem)
      .join("\n")}\n\t</tbody>\n</table>`,
  ])
  .join("\n\n");

function formatItem(item) {
  return `\t\t<tr>\n${Object.entries(columns)
    .filter(([_name, label]) => label !== undefined)
    .map(([name]) => columnFormatter[name]?.(item[name]) ?? item[name])
    .map(
      (value) =>
        `\t\t\t<td>${
          typeof value === "string" && value.includes("\n")
            ? `\n\t\t\t\t${value
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean)
                .join("<br>\n\t\t\t\t")}\n\t\t\t`
            : value ?? ""
        }</td>`,
    )
    .join("\n")}\n\t\t</tr>`;
}

const final = `# Change Log\n\n${formatted}`;
fs.writeFileSync("out.md", final);
