
export const encodeData = <T,>(data: T): string => {
    const jsonString = JSON.stringify(data);
    return encodeURIComponent(jsonString);
};

export const decodeData = <T,>(encodedData: string): T => {
    const jsonString = decodeURIComponent(encodedData);
    return JSON.parse(jsonString);
};
