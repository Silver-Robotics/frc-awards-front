// Award lists by pair type — mirrors the FIRST Championship Excel tool.
// All MCI pairs evaluate every machine award; all TA pairs evaluate every team award.

export const MCI_AWARDS = [
  'Autonomous',
  'Innovation in Control',
  'Excellence in Engineering',
  'Creativity',
  'Industrial Design',
  'Quality',
]

export const TA_AWARDS = [
  'Imagery',
  'Sustainability',
  'Gracious Professionalism',
  'Engineering Inspiration',
  'Team Spirit',
  'Rising All Star',
  'Rookie All Star',
  'Judges',
]

// Default Day-2 group assignments — roughly balanced workload.
// MCI pairs use groups A and B; TA pairs use groups C and D.
export const MCI_DEFAULTS = {
  'Autonomous':                  'A',
  'Innovation in Control':       'A',
  'Excellence in Engineering':   'A',
  'Creativity':                  'B',
  'Industrial Design':           'B',
  'Quality':                     'B',
}

export const TA_DEFAULTS = {
  'Imagery':                  'C',
  'Sustainability':             'C',
  'Gracious Professionalism':  'C',
  'Engineering Inspiration':   'C',
  'Team Spirit':               'D',
  'Rising All Star':           'D',
  'Rookie All Star':           'D',
  'Judges':                    'D',
}

export const AWARDS_BY_TYPE = { mci: MCI_AWARDS, ta: TA_AWARDS }

// Day-2 role letters per pair type
export const ROLES_BY_TYPE = { mci: ['A', 'B'], ta: ['C', 'D'] }
