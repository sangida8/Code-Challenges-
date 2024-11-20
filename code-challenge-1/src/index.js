const solution = (n) => {
  let evenSum = 0;
  let oddSum = 0;

  for (let i = 0; i < n.toString().length; i++) {
    let digit = parseInt(n.toString()[i]);
    if (digit % 2 === 0) {
      evenSum = evenSum + digit;
    } else {
      oddSum = oddSum + digit;
    }
  }

  return evenSum - oddSum;
};

// Example usage
const number = 412;
const result = solution(number);
console.log(result);
