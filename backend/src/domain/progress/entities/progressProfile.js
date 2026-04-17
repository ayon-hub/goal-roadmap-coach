function cloneItems(items) {
  return items.map((item) => ({ ...item }));
}

function createProgressProfile({ positiveFactors, constraints }) {
  return {
    positiveFactors: cloneItems(positiveFactors),
    constraints: cloneItems(constraints)
  };
}

module.exports = {
  createProgressProfile
};
