export const regexArray = ["Id", "Dob", "Pan", ];

export function uppercaseWordsInString(str) {
    return str
        ?.split(" ")
        .map((word) => {
            return regexArray.includes(word) ? word.toUpperCase() : word;
        })
        .join(" ");
}
