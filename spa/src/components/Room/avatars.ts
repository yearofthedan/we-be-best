const ICY = '🥶';
const NERD = '🤓';
const COOL = '😎';
const YEEHAW = '🤠';
const PARTY = '🥳';
const MIND_BLOWN = '🤯';
const ROBOT = '🤖';
const ALIEN = '👽';
const JACKO = '🎃';
const PANDA = '🐼';
const MONKEY = '🐵';
const KOALA = '🐨';
const RABBIT = '🐰';
const FOX = '🦊';
const CAT = '🐱';
const DOG = '🐶';
const HAMSTER = '🐹';
const BEAR = '🐻';

export const getRandom = (): string => {
  const random = (Number(Math.random() * (AVATARS.length - 1)).toFixed(
    0
  ) as unknown) as number;
  return AVATARS[random];
};

export const AVATARS = [
  ICY,
  NERD,
  COOL,
  YEEHAW,
  PARTY,
  MIND_BLOWN,
  ROBOT,
  ALIEN,
  JACKO,
  PANDA,
  MONKEY,
  KOALA,
  RABBIT,
  FOX,
  CAT,
  DOG,
  HAMSTER,
  BEAR,
];
