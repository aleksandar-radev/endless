/**
 * Migration 0.9.1
 * 
 * Skill System Redesign Migration
 * - Changed from progressive cost (+1 SP per 50 levels) to flat 1 SP per level
 * - Refund excess skill points spent under old system
 * - Ensure totalEarnedSkillPoints is updated correctly
 */

function calculateOldSkillPointCost(currentLevel, qty) {
  if (!Number.isFinite(qty) || qty <= 0) return 0;
  const levels = Math.floor(qty);
  if (levels <= 0) return 0;

  // Old system: base 1 SP + additional 1 SP for every 50 levels
  const startLevel = Math.max(0, Math.floor(currentLevel));
  let totalCost = 0;
  
  for (let i = 0; i < levels; i++) {
    const level = startLevel + i;
    const cost = 1 + Math.floor(level / 50);
    totalCost += cost;
  }
  
  return totalCost;
}

function calculateNewSkillPointCost(currentLevel, qty) {
  // New system: flat 1 SP per level
  return Math.floor(qty);
}

export function run(rawData) {
  const data = JSON.parse(JSON.stringify(rawData || {}));
  
  // Only process if skillTree exists
  if (!data.skillTree || typeof data.skillTree !== 'object') {
    return { data, result: true };
  }

  const skillTree = data.skillTree;
  
  // Calculate total spent under old system
  let totalSpentOld = 0;
  let totalSpentNew = 0;
  
  if (skillTree.skills && typeof skillTree.skills === 'object') {
    Object.values(skillTree.skills).forEach((skillData) => {
      const level = skillData?.level || 0;
      if (level <= 0) return;
      
      totalSpentOld += calculateOldSkillPointCost(0, level);
      totalSpentNew += calculateNewSkillPointCost(0, level);
    });
  }
  
  // Calculate refund amount
  const refundAmount = totalSpentOld - totalSpentNew;
  
  if (refundAmount > 0) {
    // Add refund to available skill points
    skillTree.skillPoints = (skillTree.skillPoints || 0) + refundAmount;
    
    // Ensure totalEarnedSkillPoints is consistent
    const currentPoints = skillTree.skillPoints || 0;
    const minimumTotal = currentPoints + totalSpentNew;
    
    if (!Number.isFinite(skillTree.totalEarnedSkillPoints) || skillTree.totalEarnedSkillPoints < minimumTotal) {
      skillTree.totalEarnedSkillPoints = minimumTotal;
    }
  }
  
  // Do the same for specialization skills
  let totalSpecSpentOld = 0;
  let totalSpecSpentNew = 0;
  
  if (skillTree.specializationSkills && typeof skillTree.specializationSkills === 'object') {
    Object.values(skillTree.specializationSkills).forEach((skillData) => {
      const level = skillData?.level || 0;
      if (level <= 0) return;
      
      totalSpecSpentOld += calculateOldSkillPointCost(0, level);
      totalSpecSpentNew += calculateNewSkillPointCost(0, level);
    });
  }
  
  const specRefundAmount = totalSpecSpentOld - totalSpecSpentNew;
  
  // For specialization points, they are recalculated from hero level, so no refund needed
  // Just ensure consistency
  
  return { data, result: true };
}
