const fs = require("node:fs");
module.exports = function (config) {
  if (!process.env.CHROME_BIN) {
    const edge = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
    if (fs.existsSync(edge)) process.env.CHROME_BIN = edge;
  }
  function Results(baseReporterDecorator) {
    baseReporterDecorator(this);
    const cases = [];
    this.onSpecComplete = (_, r) =>
      cases.push({
        name: r.fullName,
        success: r.success,
        skipped: r.skipped,
        errors: r.log,
      });
    this.onRunComplete = () => {
      fs.mkdirSync("reports", { recursive: true });
      fs.writeFileSync(
        "reports/test-results.json",
        JSON.stringify({ date: new Date().toISOString(), cases }, null, 2),
      );
    };
  }
  config.set({
    frameworks: ["jasmine"],
    files: [
      ".test-build/suite.js",
      { pattern: "public/assets/**/*", included: false, served: true },
    ],
    proxies: { "/assets/": "/base/public/assets/" },
    reporters: ["progress", "coverage", "results"],
    plugins: [
      "karma-jasmine",
      "karma-chrome-launcher",
      "karma-coverage",
      { "reporter:results": ["type", Results] },
    ],
    browsers: ["ChromeHeadless"],
    singleRun: true,
    client: { jasmine: { random: false } },
    coverageReporter: {
      dir: "coverage",
      subdir: ".",
      reporters: [
        { type: "html" },
        { type: "json-summary" },
        { type: "text-summary" },
      ],
    },
    browserNoActivityTimeout: 30000,
  });
};
