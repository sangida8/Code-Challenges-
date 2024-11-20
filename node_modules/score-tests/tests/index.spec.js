const ScoreCounter = require('../src');

const getMockJestExpectObj = (testDataObj) => ({
  getState: () => (testDataObj),
});

const SUITE_NAME = 'My Test Suite';
const expectedSuitePrefix = 'MyTeSu';
const expectedTestId1 = `${expectedSuitePrefix}1`;
const expectedTestId2 = `${expectedSuitePrefix}2`;

describe('Main ScoreCounter Tests', () => {
  it('should be init', () => {
    const scoreCounter = new ScoreCounter(SUITE_NAME, __dirname);
    expect(scoreCounter.idToTestNameHash).toEqual({});
    expect(scoreCounter.testNameToIdHash).toEqual({});
    expect(scoreCounter.testSuiteName).toEqual(SUITE_NAME);
    expect(scoreCounter.testSuitePrefix).toEqual(expectedSuitePrefix);
    expect(scoreCounter.testSuiteScores).toEqual({ [SUITE_NAME]: {} });
    expect(scoreCounter.scoreResultsPath).toEqual(`${__dirname}/scores.json`);
  });

  it('should add a test', () => {
    const scoreCounter = new ScoreCounter(SUITE_NAME, __dirname);
    const currentTestName = 'should add a test';
    const mockJestExpectObj = getMockJestExpectObj({ currentTestName });

    const trueReturn = scoreCounter.add(mockJestExpectObj);

    expect(trueReturn).toBe(true);
    expect(scoreCounter.testSuiteScores).toEqual({ [SUITE_NAME]: { [expectedTestId1]: 0 } });
    expect(scoreCounter.idToTestNameHash).toEqual({ [expectedTestId1]: currentTestName });
    expect(scoreCounter.testNameToIdHash).toEqual({ [currentTestName]: expectedTestId1 });
  });

  it('should add multiple tests', () => {
    const scoreCounter = new ScoreCounter(SUITE_NAME, __dirname);
    const currentTestName1 = 'should add a test';
    const currentTestName2 = 'should add another test';
    const mockJestExpectObj1 = getMockJestExpectObj({ currentTestName: currentTestName1 });
    const mockJestExpectObj2 = getMockJestExpectObj({ currentTestName: currentTestName2 });

    scoreCounter.add(mockJestExpectObj1);
    scoreCounter.add(mockJestExpectObj2);

    const expectedIdToNameHash = {
      [expectedTestId1]: currentTestName1,
      [expectedTestId2]: currentTestName2,
    };
    const expectedNameToIdHash = {
      [currentTestName1]: expectedTestId1,
      [currentTestName2]: expectedTestId2,
    };
    const expectedScoreObj = {
      [SUITE_NAME]: {
        [expectedTestId1]: 0,
        [expectedTestId2]: 0,
      },
    };

    expect(scoreCounter.idToTestNameHash).toEqual(expectedIdToNameHash);
    expect(scoreCounter.testNameToIdHash).toEqual(expectedNameToIdHash);
    expect(scoreCounter.testSuiteScores).toEqual(expectedScoreObj);
  });

  it('should mark a test correct', () => {
    const scoreCounter = new ScoreCounter(SUITE_NAME, __dirname);
    const currentTestName = 'should add a test';
    const mockJestExpectObj = getMockJestExpectObj({ currentTestName });

    scoreCounter.add(mockJestExpectObj);
    scoreCounter.correct(mockJestExpectObj);

    const expectedScoreObj = {
      [SUITE_NAME]: {
        [expectedTestId1]: 1,
      },
    };

    expect(scoreCounter.testSuiteScores).toEqual(expectedScoreObj);
  });

  it('should mark a test correct without altering other test scores', () => {
    const scoreCounter = new ScoreCounter(SUITE_NAME, __dirname);
    const currentTestName1 = 'should add a test';
    const currentTestName2 = 'should add another test';
    const mockJestExpectObj1 = getMockJestExpectObj({ currentTestName: currentTestName1 });
    const mockJestExpectObj2 = getMockJestExpectObj({ currentTestName: currentTestName2 });

    scoreCounter.add(mockJestExpectObj1);
    scoreCounter.correct(mockJestExpectObj1);
    scoreCounter.add(mockJestExpectObj2);

    const expectedScoreObj = {
      [SUITE_NAME]: {
        [expectedTestId1]: 1,
        [expectedTestId2]: 0,
      },
    };

    expect(scoreCounter.testSuiteScores).toEqual(expectedScoreObj);
  });

  it('should log an error but not throw if a test is marked correct that was not added', () => {
    const logError = jest.spyOn(console, 'error').mockImplementation(() => {});

    const scoreCounter = new ScoreCounter(SUITE_NAME, __dirname);
    const currentTestName = 'should add a test';
    const mockJestExpectObj = getMockJestExpectObj({ currentTestName });

    expect(() => scoreCounter.correct(mockJestExpectObj)).not.toThrow();
    const expectedMsg = `Could not find test id: "undefined" in test suite ${SUITE_NAME}, did you .add() it first?`;
    expect(logError).toBeCalledWith(expectedMsg);

    logError.mockReset();
  });
});
