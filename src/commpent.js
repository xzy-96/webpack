export default () => {
    const element = document.createElement('div');

    element.innerHTML = join(['Hello', 'webpack'], ' ');
    element.className = 'rounded bg-red-100 border max-w-md m-4 p-4';
    element.onclick = () =>
        import('./lazy')
            .then((lazy) => {
                console.log(lazy, 'lazy11');
                element.textContent = lazy.default;
            })
            .catch((err) => console.error(err));
    return element;
};
