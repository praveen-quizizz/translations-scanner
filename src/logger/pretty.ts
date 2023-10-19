import chalk from 'chalk';


class PrettyLogger {
  log(message: string) {
    console.log(chalk.greenBright(message) + '\n');
  }

  info(message: string) {
    console.info(chalk.blue(message) + '\n');
  }

  success(message: string) {
    console.log(chalk.green(message) + '\n');
  }

  warning(message: string) {
    console.warn(chalk.yellow(message) + '\n');
  }

  error(message: string) {
    console.error(chalk.red(message) + '\n');
  }

  logOnSameLine(message: string) {
    process.stdout.clearLine(1);
    process.stdout.moveCursor(0, -2);
    this.log(message);
  }

  logJson(message: object) {
    this.log(JSON.stringify(message, null, 2));
  }

  infoJson(message: object) {
    this.info(JSON.stringify(message, null, 2));
  }

  successJson(message: object) {
    this.success(JSON.stringify(message, null, 2));
  }

  warningJson(message: object) {
    this.warning(JSON.stringify(message, null, 2));
  }

  errorJson(message: object) {
    this.error(JSON.stringify(message, null, 2));
  }
}

const pretty = new PrettyLogger();

export default pretty;
