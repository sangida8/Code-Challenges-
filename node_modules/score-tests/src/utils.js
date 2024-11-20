const getTestNameFromExpect = (jestExpectObj) => jestExpectObj.getState().currentTestName;

const getTestSuitePrefix = (testSuite) => testSuite
  .split(' ')
  .map((str) => str.slice(0, 2)).join('');

const getHumanReadableResults = (results) => {
  const readableOutput = {};
  let totalScore = 0;
  let totalMax = 0;
  const { testScores } = results;

  Object.keys(testScores)
    .forEach((testSuiteName) => {
      const score = Object.values(testScores[testSuiteName])
        .map((testIdObj) => testIdObj)
        .reduce((sum, val) => sum + val, 0);

      const maxScore = Object.values(testScores[testSuiteName]).length;
      totalScore += score;
      totalMax += maxScore;
      readableOutput[testSuiteName] = `${score}/${maxScore}`;
    });

  readableOutput.finalTestScore = `FINAL SCORE: ${totalScore}/${totalMax}`;
  return readableOutput;
};

module.exports = {
  getTestNameFromExpect,
  getTestSuitePrefix,
  getHumanReadableResults,
};
