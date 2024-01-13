 export function levenshteinDistance(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
        }
      }
    }
    return matrix[b.length][a.length];
  }
  
 export function similarity(a, b) {
    const distance = levenshteinDistance(a, b);
    const longestString = Math.max(a.length, b.length);
    return (longestString - distance) / longestString;
  }
  


  // const testPairs = [
  //   ["The rapid advancement of technology has led to significant changes in the way we live. Smartphones, for instance, have become integral to our daily lives.", "The swift advancement of technology led to major changes in our daily lives. Smartphones, for example, have become essential to our everyday routines."],
  //   ["Environmental conservation is crucial for the future of our planet. Efforts to reduce pollution and preserve natural habitats are essential.", "Environmental protection is vital for our planet's future. Actions to decrease pollution and conserve natural habitats are necessary."],
  //   ["Eating a balanced diet is key to maintaining good health. It's important to consume a variety of nutrients and vitamins.", "Maintaining good health requires eating a balanced diet. It's crucial to include a variety of nutrients and vitamins in your meals."],
  //   ["Regular exercise contributes significantly to a healthy lifestyle. Activities like jogging, swimming, or cycling are highly beneficial.", "A healthy lifestyle is greatly enhanced by regular exercise. Engaging in activities such as jogging, swimming, or cycling is very beneficial."],
  //   ["The study of history enables us to understand the past, which in turn allows us to make sense of the present. It's a crucial field of study.", "Understanding the past through the study of history helps us make sense of the present. This field of study is extremely important."],
  //   ["Artificial intelligence is transforming industries worldwide. Its applications range from data analysis to automation and beyond.", "Industries across the globe are being transformed by artificial intelligence. Its uses extend from analyzing data to automating various tasks."],
  //   ["Global travel opens up new horizons and opportunities for learning about different cultures. It's a gateway to experiencing the world.", "Traveling globally opens new horizons and offers opportunities to learn about diverse cultures. It is a way to experience the world."],
  //   ["Advancements in medical research have led to significant improvements in healthcare. New treatments and drugs are saving lives.", "Significant advancements in medical research have improved healthcare considerably. Lives are being saved by new treatments and medications."],
  //   ["Effective communication skills are essential in the modern workplace. They enhance teamwork and productivity.", "In today's workplace, effective communication is crucial. It improves teamwork and increases productivity."],
  //   ["Sustainable energy sources like solar and wind power are becoming increasingly important as we address climate change.", "As we tackle climate change, sustainable sources of energy such as solar and wind are gaining importance."]
  // ];
  
  // testPairs.forEach((pair, index) => {
  //   const score = similarity(pair[0], pair[1]);
  // });