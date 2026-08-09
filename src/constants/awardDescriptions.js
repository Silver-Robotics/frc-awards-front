/**
 * FRC Award descriptions and criteria, sourced directly from the
 * FIRST Robotics Competition Award Workbook (Rev. Oct 2025).
 */
export const AWARD_INFO = {

  // ── Machine Attribute Awards ───────────────────────────────────────────────

  "Autonomous": {
    category: "MCI",
    description:
      "Celebrates the team whose machine demonstrated consistent, reliable, " +
      "high-performance robot operation during autonomous (non-operated) actions " +
      "in match play. Evaluation focuses on the robot's ability to sense its " +
      "surroundings, position itself or onboard mechanisms appropriately, and execute tasks.",
    criteria: [
      "Team can describe how the robot perceives surroundings and executes tasks autonomously",
      "Consistent and reliable operation is weighted more heavily than maximum point scoring",
      "Applies to both the opening 15-second period and autonomous actions during tele-op",
    ],
  },

  "Creativity": {
    category: "MCI",
    sponsor: "Rockwell Automation",
    description:
      "Celebrates a creative robotic component, concept, or attribute that enhances " +
      "the team's strategy of play — one that was intentionally designed, not accidentally discovered.",
    criteria: [
      "Team can trace the creative feature's conception and design",
      "The element is unique and has a practical contribution to competition objectives",
      "Team can describe how they mitigated the inherent risk of failure",
      "When it functions as designed, it directly contributes to success on the field",
    ],
  },

  "Excellence in Engineering": {
    category: "MCI",
    sponsor: "Littelfuse",
    description:
      "Celebrates the team whose machine incorporates an engineering solution " +
      "designed to have components work together seamlessly.",
    criteria: [
      "Team can describe the problem(s) identified and how the machine addresses them",
      "The engineering process can be traced from conception through completion",
      "The solution is functional, practical, and did not create new problems",
      "The engineering solution contributes to the team's success on the field",
    ],
  },

  "Industrial Design": {
    category: "MCI",
    description:
      "Celebrates the team whose machine demonstrates industrial design principles, " +
      "striking a balance between form, function, and aesthetics.",
    criteria: [
      "Team can describe how the machine design is elegant, efficient, and practical",
      "The entire machine — not just one component — merits recognition",
      "The robot distinguishes itself by its aesthetic, design, and performance",
    ],
  },

  "Innovation in Control": {
    category: "MCI",
    sponsor: "nVent",
    description:
      "Celebrates an innovative control system or application of control components " +
      "— electrical, mechanical, or software — that provides unique machine functions.",
    criteria: [
      "Team can trace the control innovation's conception, design, manufacturing, or deployment",
      "The control system is innovative, unique, and integrated with machine and human players",
      "The innovation is practical, addresses the game's challenge, and is reliable under competition stress",
    ],
  },

  "Quality": {
    category: "MCI",
    description:
      "Celebrates machine robustness in concept and fabrication.",
    criteria: [
      "Team can describe their quality plan and how it ensures robustness throughout the competition",
      "The entire machine demonstrates quality: workmanship, welds, wiring, paint, etc.",
      "The machine can withstand competition rigors via designed-in redundancy and risk mitigation",
      "The build quality directly contributes to the team's success on the field",
    ],
  },

  // ── Team Attribute Awards ──────────────────────────────────────────────────

  "Engineering Inspiration": {
    category: "TA",
    description:
      "Celebrates a team that demonstrates outstanding success in advancing respect " +
      "and appreciation for engineering within their school, organization, and community.",
    criteria: [
      "Extent and inventiveness of efforts to recruit students to engineering or STEM fields",
      "Effectiveness of community outreach and commitment to science and technology education",
      "Achievement of the FIRST mission communicated both at and away from competition",
      "Efforts are ongoing — not strictly concentrated on the build and competition season",
    ],
  },

  "Gracious Professionalism": {
    category: "TA",
    description:
      "Celebrates outstanding demonstration of FIRST Core Values — including continuous " +
      "Gracious Professionalism, sportsmanship, and working together both on and off the field.",
    criteria: [
      "Team exemplifies FIRST Core Values in relationships with other teams",
      "Consistent Gracious Professionalism and positive attitude on and off the field",
      "If collaborated pre-season: can describe how tasks were divided fairly and communication flowed",
      "Can explain how working together as a group was beneficial over working independently",
    ],
  },

  "Imagery": {
    category: "TA",
    sponsor: "In honor of Jack Kamen",
    description:
      "Celebrates attractiveness in engineering and outstanding visual aesthetic integration " +
      "of machine and team appearance.",
    criteria: [
      "Team can describe their theme and its origins",
      "The theme is original and fitting to the team's objectives, character, and/or history",
      "Theme is incorporated into all aspects: uniforms, pit, machine, mascot, etc.",
      "Visuals of the integrated team/machine are exceptional and attractive",
      "The team theme supports the principles of FIRST Core Values",
    ],
  },

  "Judges": {
    category: "TA",
    description:
      "During the competition, the judging panel may decide that a team's unique efforts, " +
      "performance, or dynamics merit special recognition not covered by other award criteria.",
    criteria: [
      "Team has fully embraced the principles of FIRST",
      "Multiple judges have noticed and commented on the team's positive aspects",
      "The team exemplifies a positive attribute not addressed by any other award criteria",
    ],
  },

  "Rising All Star": {
    category: "TA",
    note: "Optional Award",
    description:
      "Celebrates the team that has persisted through challenges despite the difficulties " +
      "of being young — whether a new team or one with recent significant turnover in membership.",
    criteria: [
      "Team understands the FIRST mission and demonstrates Gracious Professionalism and Coopertition",
      "Team is a role model for other young teams and stands out as having a sustainable, promising future",
      "Recognizes new teams or teams with new beginnings — does not require first-year status",
      "Teams in their second or third year who succeeded despite challenges are also eligible",
    ],
  },

  "Rookie All Star": {
    category: "TA",
    note: "Optional Award — team number 10,900 or higher",
    description:
      "Celebrates the rookie team exemplifying a young but strong partnership effort, " +
      "as well as implementing the FIRST mission to inspire students to learn more about science and technology.",
    criteria: [
      "Team seems like a 'FIRST Impact Award team in the making' — leadership, vision, spirit, community activities",
      "True partnership between school/organization and sponsors",
      "Team understands what FIRST is really trying to accomplish and envisions a future with it",
      "Team has built a robot appropriate to the game's challenges",
    ],
  },

  "Team Spirit": {
    category: "TA",
    description:
      "Celebrates extraordinary enthusiasm and spirit through exceptional partnership " +
      "and teamwork furthering the objectives of FIRST.",
    criteria: [
      "Team displays obvious enthusiasm in supporting teams, appearance, and interactions at the competition",
      "Spirit is apparent in everything they do — at school, in their community, with sponsors and other teams",
      "They demonstrate spirit as a unified team",
    ],
  },

  "Sustainability": {
    category: "TA",
    sponsor: "Dow",
    description:
      "Celebrates a team that has developed sustainable practices focused on a " +
      "\"triple bottom line\" — People, Prosperity, and Planet — to achieve positive impact and long-term continuity.",
    criteria: [
      "People: how the team recruits, trains, and retains students, mentors, and sponsors",
      "Prosperity: how the team fundraises, creates/tracks budgets, and manages financial risks",
      "Planet: how the team assesses its environmental impact and what it does to mitigate or reduce it",
    ],
  },
};
