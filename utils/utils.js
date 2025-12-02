export function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function getRandomSymptoms(dataset) {
  const allSymptoms = dataset.flatMap(d => d.symptoms);
  return shuffle(allSymptoms).slice(0, 6);
}

export function calculateProbabilities(dataset, selectedSymptoms) {
  return dataset
    .map(d => {
      const matchCount = d.symptoms.filter(s =>
        selectedSymptoms.includes(s)
      ).length;

      return {
        disease: d.disease,
        symptoms: d.symptoms,
        medicines: d.medicines,
        probability: matchCount / d.symptoms.length
      };
    })
    .sort((a, b) => b.probability - a.probability);
}

export function getNextSymptoms(dataset, selectedSymptoms) {
  const ranked = calculateProbabilities(dataset, selectedSymptoms);

  let nextList = [];

  nextList.push(...shuffle(ranked[0].symptoms).slice(0, 2));

  if (ranked[1]) {
    nextList.push(...shuffle(ranked[1].symptoms).slice(0, 2));
  }

  nextList.push(...getRandomSymptoms(dataset));

  nextList = nextList.filter(sym => !selectedSymptoms.includes(sym));

  return [...new Set(nextList)].slice(0, 6);
}


