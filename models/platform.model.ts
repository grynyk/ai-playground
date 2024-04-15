export interface PlatformApiData {
    code?: number;
    token?: string;
    cookie?: string;
    msg?: string;
    note?: string;
    input?: string | string[];
    blog?: string[];
    question?: string;
    answer?: string;
    hint?: string;
    hint1?: string;
    hint2?: string;
    hint3?: string;
}

interface PlatformApiResponseData {
    code: number;
    msg: string;
    note: string;
}

export interface PlatformApiResponse extends PlatformApiResponseData {
    response: {
        data: PlatformApiResponseData;
    }
}