const fs = require('fs');
const path = require('path');

const { getTestNameFromExpect, getTestSuitePrefix, getHumanReadableResults } = require('./utils');

class ScoreCounter {
  constructor(testSuiteName, scoreResultsPath) {
    this.getId = ((id = 1) => () => id++)(); // eslint-disable-line no-param-reassign

    this.idToTestNameHash = {};
    this.testNameToIdHash = {};

    this.testSuiteName = testSuiteName;
    this.testSuitePrefix = getTestSuitePrefix(testSuiteName);
    this.testSuiteScores = { [testSuiteName]: {} };

    this.scoreResultsPath = path.join(scoreResultsPath, 'scores.json');
  }

  /**
   * Add a test to the score object with a starting value of 0.
   * Also adds the required names and id metadata.
   *
   * @param {object} jestExpectObj the Expect object from a jest test
   * @returns all current test suite scores
   */
  add = (jestExpectObj) => {
    const testName = getTestNameFromExpect(jestExpectObj);
    const testId = this.testSuitePrefix + this.getId();

    this.idToTestNameHash[testId] = testName;
    this.testNameToIdHash[testName] = testId;
    this.testSuiteScores[this.testSuiteName][testId] = 0;

    return true;
  };

  correct = (jestExpectObj, points = 1) => {
    const testName = getTestNameFromExpect(jestExpectObj);
    const testId = this.testNameToIdHash[testName];
    const testSuiteScores = this.testSuiteScores[this.testSuiteName];

    if (typeof testSuiteScores[testId] === 'number') {
      testSuiteScores[testId] += points;
    } else {
      console.error(`Could not find test id: "${testId}" in test suite ${this.testSuiteName}, did you .add() it first?`);
    }

    return this.testSuiteScores;
  };

  export = () => {
    let results = { testScores: {} };
    try {
      if (fs.existsSync(this.scoreResultsPath)) results = JSON.parse(fs.readFileSync(this.scoreResultsPath, 'utf8'));
    } catch (error) {
      console.error('Could not load scores file', error);
    }

    results.idToTestNameHash = { ...results.idToTestNameHash, ...this.idToTestNameHash };
    results.testNameToIdHash = { ...results.testNameToIdHash, ...this.testNameToIdHash };
    results.testScores = { ...results.testScores, ...this.testSuiteScores };

    const humanReadableResults = getHumanReadableResults(results);
    results.humanReadable = { ...results.humanReadable, ...humanReadableResults };

    try {
      fs.writeFileSync(this.scoreResultsPath, JSON.stringify(results, null, 2));
    } catch (error) {
      console.error('Error writing scores to file:', error);
    }
  };
}

module.exports = ScoreCounter;
