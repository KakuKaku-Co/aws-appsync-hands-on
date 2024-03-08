export function request(ctx) {
    return {
        method: "GET",
        params: {
            headers: { "Content-Type": "application/json" },
        },
        resourcePath: `/${ctx.args.id}.json`,
    };
}

export function response(ctx) {
    const user = JSON.parse(ctx.result.body);

    return {
        id: user.id,
        name: user.name,
    };
}
