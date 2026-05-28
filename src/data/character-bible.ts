export interface CharacterBibleEntry {
  character_id: string;
  display_name: string;
  gender: 'FEMALE' | 'MALE';
  age: string;
  visual_lock: string;
  wardrobe_lock: string;
  accessory_lock: string;
  behavior_lock: string;
  realism_lock: string;
}

export const CharacterBible: Record<string, CharacterBibleEntry> = {
  'MINA-01': {
    character_id: 'MINA-01',
    display_name: 'Mina',
    gender: 'FEMALE',
    age: '25',
    visual_lock: 'female Vietnamese mechanic, age 25, high ponytail',
    wardrobe_lock: 'black fitted t-shirt, olive cargo pants',
    accessory_lock: 'red screwdriver held in her LEFT hand',
    behavior_lock: 'deadpan mechanic energy',
    realism_lock: 'grounded Vietnamese realism',
  },
  'LANH-01': {
    character_id: 'LANH-01',
    display_name: 'Lanh',
    gender: 'FEMALE',
    age: '22',
    visual_lock: 'female Vietnamese marketing student, age 22, fair skin, slightly chubby',
    wardrobe_lock: 'smart-casual oversized clothing',
    accessory_lock: 'one AirPod in her right ear',
    behavior_lock: 'confident but awkward',
    realism_lock: 'grounded Vietnamese realism',
  },
  'LY-01': {
    character_id: 'LY-01',
    display_name: 'Ly',
    gender: 'FEMALE',
    age: '24',
    visual_lock: 'female Vietnamese woman, age 24',
    wardrobe_lock: 'soft coordinated fabrics',
    accessory_lock: '',
    behavior_lock: 'calm southern energy',
    realism_lock: 'grounded Vietnamese realism',
  },
  'CHUBAY-01': {
    character_id: 'CHUBAY-01',
    display_name: 'Chu Bay',
    gender: 'MALE',
    age: '60+',
    visual_lock: 'Vietnamese man, age 60+',
    wardrobe_lock: 'checkered shirt',
    accessory_lock: 'low stool, coffee phin',
    behavior_lock: 'observational energy',
    realism_lock: 'grounded Vietnamese realism',
  },
};
