export const getFutureMinutes = (minutes: number) => {
    return new Date(Date.now() + minutes * (60 * 1000)).getTime();
};