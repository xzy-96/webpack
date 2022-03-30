export default (text = HELLO) => {
  const element = document.createElement("div");
  element.innerHTML = text;
  element.className = "rounded bg-red-100 border max-w-md m-4 p-4";
  element.onclick = () =>
    import("./lazy")
      .then((lazy) => {
        console.log(lazy, "lazy");
        element.textContent = lazy.default;
      })
      .catch((err) => console.error(err));
  return element;
};
