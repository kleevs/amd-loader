export function map<T1, T2>(array: T1[], parse: (x: T1, index?: number) => T2): T2[] {
    let res = [];
    array.forEach((x, i) => { var y = parse(x, i); y !== undefined && res.push(y); });
    return res;
}