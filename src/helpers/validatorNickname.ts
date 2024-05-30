export const validatorNickname = (nickname: string) => {
    const regex = /^[а-яА-Яa-zA-Z0-9_]+$/;
    return nickname.length >= 3 && nickname.length <= 20 && regex.test(nickname);
};