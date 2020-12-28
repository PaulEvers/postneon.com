export default function getMousePosition(dom, x, y) {
    let rect = dom.getBoundingClientRect();
    return [(x - rect.left) / rect.width, (y - rect.top) / rect.height];
}