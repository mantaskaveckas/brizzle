import * as path from "path";

export const log = {
  create: (filePath: string) => {
    const relative = path.relative(process.cwd(), filePath);
    console.log(`      \x1b[32mcreate\x1b[0m  ${relative}`);
  },
  force: (filePath: string) => {
    const relative = path.relative(process.cwd(), filePath);
    console.log(`       \x1b[33mforce\x1b[0m  ${relative}`);
  },
  skip: (filePath: string) => {
    const relative = path.relative(process.cwd(), filePath);
    console.log(`        \x1b[33mskip\x1b[0m  ${relative}`);
  },
  remove: (filePath: string) => {
    const relative = path.relative(process.cwd(), filePath);
    console.log(`      \x1b[31mremove\x1b[0m  ${relative}`);
  },
  notFound: (filePath: string) => {
    const relative = path.relative(process.cwd(), filePath);
    console.log(`   \x1b[33mnot found\x1b[0m  ${relative}`);
  },
  wouldCreate: (filePath: string) => {
    const relative = path.relative(process.cwd(), filePath);
    console.log(`\x1b[36mwould create\x1b[0m  ${relative}`);
  },
  wouldForce: (filePath: string) => {
    const relative = path.relative(process.cwd(), filePath);
    console.log(` \x1b[36mwould force\x1b[0m  ${relative}`);
  },
  wouldRemove: (filePath: string) => {
    const relative = path.relative(process.cwd(), filePath);
    console.log(`\x1b[36mwould remove\x1b[0m  ${relative}`);
  },
  error: (message: string) => {
    console.error(`\x1b[31mError:\x1b[0m ${message}`);
  },
  info: (message: string) => {
    console.log(message);
  },
};
