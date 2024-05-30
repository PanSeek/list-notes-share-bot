export const validatorNameList = (name: string) => {
    const regex = /^[\sа-яА-ЯёЁa-zA-Z0-9_-]+$/;
    return name.length >= 3 && name.length <= 20 && regex.test(name);
};