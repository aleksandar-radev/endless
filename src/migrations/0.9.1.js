export const run = (rawData) => {
  const data = JSON.parse(JSON.stringify(rawData || {}));

  // Migration for skill system overhaul
  // The skill cost structure changed from progressive (1 + level/50) to flat (1 per level)
  // This means players should get refunded skill points based on the old cost structure
  
  if (data.skillTree && data.skillTree.skills) {
    let refundPoints = 0;
    
    // Calculate refund based on old cost structure
    Object.values(data.skillTree.skills).forEach((skill) => {
      const level = skill.level || 0;
      if (level > 0) {
        // Old cost calculation: sum of (1 + floor(currentLevel / 50)) for each level
        // This is more complex, but we'll refund the difference
        for (let i = 0; i < level; i++) {
          const oldCost = 1 + Math.floor(i / 50);
          const newCost = 1;
          refundPoints += (oldCost - newCost);
        }
      }
    });
    
    // Refund specialization skills as well
    if (data.skillTree.specializationSkills) {
      Object.values(data.skillTree.specializationSkills).forEach((skill) => {
        const level = skill.level || 0;
        if (level > 0) {
          for (let i = 0; i < level; i++) {
            const oldCost = 1 + Math.floor(i / 50);
            const newCost = 1;
            refundPoints += (oldCost - newCost);
          }
        }
      });
    }
    
    // Add refunded points
    if (refundPoints > 0) {
      data.skillTree.skillPoints = (data.skillTree.skillPoints || 0) + refundPoints;
      data.skillTree.totalEarnedSkillPoints = (data.skillTree.totalEarnedSkillPoints || 0) + refundPoints;
    }
  }

  return { data, result: true };
};
