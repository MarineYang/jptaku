export interface User {
  name: string;
  level: string;
  streak: number;
  points: number;
  avatarUrl: string;
}

export const userMock: User = {
  name: "김철수",
  level: "N4 중급",
  streak: 12,
  points: 1250,
  avatarUrl: "https://github.com/shadcn.png",
};