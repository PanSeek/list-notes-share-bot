export const validatorNote = (name: string) => {
    const re = /%CC%/g;
    return name.length <= 256 && !re.test(encodeURIComponent(name));
};