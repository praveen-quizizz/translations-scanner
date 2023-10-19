import * as p from '@clack/prompts';

class ClackLogger {
    public intro(text: string) {
        p.intro(text);
    }

    public outro(text: string) {
        p.outro(text);
    }

    public createSpinner() {
        return p.spinner();
    }
}

const clack = new ClackLogger();

export default clack;