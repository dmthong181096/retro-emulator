// Console configuration data
export const CONSOLES = {
  nes: {
    id: 'nes',
    name: 'Nintendo Entertainment System',
    icon: '🎮',
    description: 'Console huyền thoại với những game kinh điển như Mario, Zelda',
    files: ['.nes'],
    color: 'nes',
    core: 'fceumm'
  },
  snes: {
    id: 'snes',
    name: 'Super Nintendo',
    icon: '🕹️',
    description: 'Thế hệ tiếp theo với đồ họa 16-bit tuyệt vời',
    files: ['.smc', '.sfc'],
    color: 'snes',
    core: 'snes9x'
  },
  gb: {
    id: 'gb',
    name: 'Game Boy',
    icon: '📱',
    description: 'Console cầm tay huyền thoại của Nintendo',
    files: ['.gb', '.gbc'],
    color: 'gb',
    core: 'gambatte'
  },
  gba: {
    id: 'gba',
    name: 'Game Boy Advance',
    icon: '🎯',
    description: 'Game Boy với đồ họa 32-bit và màn hình màu',
    files: ['.gba'],
    color: 'gba',
    core: 'mgba'
  },
  genesis: {
    id: 'genesis',
    name: 'Sega Genesis',
    icon: '⚡',
    description: 'Console 16-bit của Sega với Sonic the Hedgehog',
    files: ['.md', '.gen'],
    color: 'genesis',
    core: 'genesis_plus_gx'
  },
  psx: {
    id: 'psx',
    name: 'PlayStation 1',
    icon: '💿',
    description: 'Console 32-bit đầu tiên của Sony',
    files: ['.bin', '.iso'],
    color: 'psx',
    core: 'pcsx_rearmed'
  }
};

// Helper functions
export const getConsoleById = (id) => {
  return CONSOLES[id] || null;
};

export const getAllConsoles = () => {
  return Object.values(CONSOLES);
};

export const getConsoleCore = (consoleId) => {
  const console = CONSOLES[consoleId];
  return console ? console.core : 'mgba';
};