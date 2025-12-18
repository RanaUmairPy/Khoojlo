export const createSlug = (name) => {
    if (!name) return 'product';
    return name
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
};

export const createProductUrl = (id, name) => {
    const slug = createSlug(name);
    return `/product/${slug}-${id}`;
};
