export const print = (tag: string, ...args: unknown[]) => {
    const reset = '\x1b[0m';
    const blue = '\x1b[1m\x1b[36m';
    const green = '\x1b[1m\x1b[32m';
    const red = '\x1b[1m\x1b[4m\x1b[31m';

    let color = green;
    if (/error/ig.test(tag))
        color = red;

    console.log(`${ blue }[${ new Date().toISOString() }]`, `${ color }[${ tag }]:${ reset }`, ...args);
};