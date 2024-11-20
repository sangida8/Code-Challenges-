// We're stringifying outputs since the files have to work like that
// be wary of the order of the keys in the objects because of this

const fs = require('fs');
const path = require('path');
const ScoreCounter = require('../src');

const getMockJestExpectObj = (testDataObj) => ({
  getState: () => (testDataObj),
});

const SUITE_NAME = 'My Test Suite';
const SCORE_DIR = path.join(__dirname, 'score-dir');
const SCORE_JSON_PATH = path.join(SCORE_DIR, 'scores.json');

const currentTestName = 'should add a test';
const expectedTestId = 'MyTeSu1';
const expectedFinal = {
  testScores: {
    [SUITE_NAME]: { [expectedTestId]: 1 },
  },
  idToTestNameHash: {
    [expectedTestId]: currentTestName,
  },
  testNameToIdHash: {
    [currentTestName]: expectedTestId,
  },
  humanReadable: {
    [SUITE_NAME]: '1/1',
    finalTestScore: 'FINAL SCORE: 1/1',
  },
};

describe('Save and Load Tests', () => {
  beforeEach(() => {
    if (fs.existsSync(SCORE_JSON_PATH)) fs.unlinkSync(SCORE_JSON_PATH);
  });

  it('can save scores to a file', () => {
    const scoreCounter = new ScoreCounter(SUITE_NAME, SCORE_DIR);
    const mockJestExpectObj = getMockJestExpectObj({ currentTestName });

    scoreCounter.add(mockJestExpectObj);
    scoreCounter.correct(mockJestExpectObj);

    scoreCounter.export();

    const savedScores = fs.readFileSync(SCORE_JSON_PATH, 'utf8');
    const expectedFormattedOutput = JSON.stringify(expectedFinal, null, 2);
    expect(savedScores).toEqual(expectedFormattedOutput);
  });

  it('does not lose any data in an existing scores.json file', () => {
    // Write the first iteration of the file
    const scoreCounter1 = new ScoreCounter(SUITE_NAME, SCORE_DIR);
    const mockJestExpectObj = getMockJestExpectObj({ currentTestName });

    scoreCounter1.add(mockJestExpectObj);
    scoreCounter1.correct(mockJestExpectObj);

    scoreCounter1.export();

    // Now update it with a second test suite
    const secondTestSuiteName = 'My Second Test Suite';
    const currentTestName2 = 'should add another test';
    const expectedTestId2 = 'MySeTeSu1';

    const scoreCounter2 = new ScoreCounter(secondTestSuiteName, SCORE_DIR);
    const mockJestExpectObj2 = getMockJestExpectObj({ currentTestName: currentTestName2 });

    scoreCounter2.add(mockJestExpectObj2);

    scoreCounter2.export();

    const expectedFinal2 = {
      testScores: {
        [SUITE_NAME]: { [expectedTestId]: 1 },
        [secondTestSuiteName]: { [expectedTestId2]: 0 },
      },
      idToTestNameHash: {
        [expectedTestId]: currentTestName,
        [expectedTestId2]: currentTestName2,
      },
      testNameToIdHash: {
        [currentTestName]: expectedTestId,
        [currentTestName2]: expectedTestId2,
      },
      humanReadable: {
        [SUITE_NAME]: '1/1',
        finalTestScore: 'FINAL SCORE: 1/2',
        [secondTestSuiteName]: '0/1',
      },
    };

    const savedScores = fs.readFileSync(SCORE_JSON_PATH, 'utf8');
    const expectedFormattedOutput = JSON.stringify(expectedFinal2, null, 2);
    expect(savedScores).toEqual(expectedFormattedOutput);
  });
});

describe('Save and Load Error Tests', () => {
  let logError;
  const mockError = new Error('Mocked Error');

  beforeEach(() => {
    logError = jest.spyOn(console, 'error').mockImplementation(() => {});
    if (fs.existsSync(SCORE_JSON_PATH)) fs.unlinkSync(SCORE_JSON_PATH);
  });

  afterEach(() => { logError.mockRestore(); });

  it('Deals with broken file, logs an error, then saves a proper format', () => {
    const brokenFile = 'this is not json';
    fs.writeFileSync(SCORE_JSON_PATH, brokenFile);

    const scoreCounter = new ScoreCounter(SUITE_NAME, SCORE_DIR);
    const mockJestExpectObj = getMockJestExpectObj({ currentTestName });

    scoreCounter.add(mockJestExpectObj);
    scoreCounter.correct(mockJestExpectObj);

    scoreCounter.export();
    expect(logError).toHaveBeenCalledTimes(1);
    const firstCallErrorDescription = logError.mock.calls[0][0];
    expect(firstCallErrorDescription).toBe('Could not load scores file');

    const savedScores = fs.readFileSync(SCORE_JSON_PATH, 'utf8');
    const expectedFormattedOutput = JSON.stringify(expectedFinal, null, 2);
    expect(savedScores).toEqual(expectedFormattedOutput);
  });

  it('If writing fails, it leaves the file in place and logs an error', () => {
    // Write a valid file first
    const scoreCounter = new ScoreCounter(SUITE_NAME, SCORE_DIR);
    const mockJestExpectObj = getMockJestExpectObj({ currentTestName });

    scoreCounter.add(mockJestExpectObj);
    scoreCounter.correct(mockJestExpectObj);

    scoreCounter.export();

    // now break things function
    const originalWriteFileSync = fs.writeFileSync;
    fs.writeFileSync = jest.fn(() => { throw mockError; });

    scoreCounter.export();

    const savedScores = fs.readFileSync(SCORE_JSON_PATH, 'utf8');
    const expectedFormattedOutput = JSON.stringify(expectedFinal, null, 2);
    expect(savedScores).toEqual(expectedFormattedOutput);

    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    expect(logError).toBeCalledWith('Error writing scores to file:', mockError);

    fs.writeFileSync = originalWriteFileSync;
  });
});
