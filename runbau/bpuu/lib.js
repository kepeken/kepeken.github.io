Big.DP = 0;
Big.RM = 0;

const mapping = {
  ii2i(x, y) {
    // x <=> y
    switch (x.cmp(y)) {
      // case lt: (y+1)**2-x
      case -1: return y.plus(1).pow(2).minus(x);
      // case eq: x**2+y+1
      case 0: return x.pow(2).plus(y).plus(1);
      // case gt: x**2+y+1
      case 1: return x.pow(2).plus(y).plus(1);
    }
  },
  i2ii(z) {
    // sqrt(z-1)
    const m = z.minus(1).sqrt();
    // z <=> m(m+1)+1
    switch (z.cmp(m.times(m.plus(1)).plus(1))) {
      // case lt: (m, z-m**2-1)
      case -1: return [m, z.minus(m.pow(2)).minus(1)];
      // case eq: (m, m)
      case 0: return [m, m];
      // case gt: ((m+1)**2-z, m)
      case 1: return [m.plus(1).pow(2).minus(z), m];
    }
  },
};

class Node {
  constructor(...args) {
    this.isNull = args.length === 0;
    this.left = args[0] || null;
    this.right = args[1] || null;
    Object.freeze(this);
  }

  height() {
    if (this.isNull) return 0;
    return Math.max(this.left.height(), this.right.height()) + 1;
  }

  toInt() {
    if (this.isNull) return Big(0);
    return mapping.ii2i(this.left.toInt(), this.right.toInt());
  }

  static fromInt(i) {
    i = Big(i).round().abs();
    if (i.eq(0)) return new Node();
    const [l, r] = mapping.i2ii(i);
    return new Node(Node.fromInt(l), Node.fromInt(r));
  }

  toString() {
    if (this.isNull) return "";
    return "(" + this.left.toString() + ")" + this.right.toString();
  }

  static fromString(src) {
    if (typeof src !== "string") throw new TypeError("invalid arguments");
    src = src.replace(/[^()]/g, "");
    let pos = -1;
    function read() {
      pos++;
      if (src[pos] === "(") {
        const left = read();
        if (src[pos] === ")") {
          const right = read();
          return new Node(left, right);
        } else {
          throw new SyntaxError("unexpected end of input");
        }
      } else {
        return new Node();
      }
    }
    const val = read();
    if (pos !== src.length) {
      throw SyntaxError("unexpected token )");
    } else {
      return val;
    }
  }

  print() {
    function getLines(n) {
      const thisInt = n.toInt().toFixed();
      if (n.isNull) {
        return null;
      } else if (n.left.isNull && n.right.isNull) {
        return ["1"];
      } else if (n.left.isNull) {
        const rightLines = getLines(n.right);
        const pad = " ".repeat(rightLines[0].match(/\d+_* *$/)[0].length);
        let line0 = thisInt + " " + pad;
        let line1 = "\\" + pad;
        if (line0.length > rightLines[0].length) {
          return [
            line0,
            line1.padStart(line0.length),
            ...rightLines.map(line => line.padStart(line0.length))
          ];
        } else {
          return [
            line0.padStart(rightLines[0].length),
            line1.padStart(rightLines[0].length),
            ...rightLines
          ];
        }
      } else if (n.right.isNull) {
        const leftLines = getLines(n.left);
        const pad = " ".repeat(leftLines[0].match(/^ *_*\d+/)[0].length);
        let line0 = pad + " " + thisInt;
        let line1 = pad + "/";
        if (line0.length > leftLines[0].length) {
          return [
            line0,
            line1.padEnd(line0.length),
            ...leftLines.map(line => line.padEnd(line0.length))
          ];
        } else {
          return [
            line0.padEnd(leftLines[0].length),
            line1.padEnd(leftLines[0].length),
            ...leftLines
          ];
        }
      } else {
        let leftLines = getLines(n.left), rightLines = getLines(n.right);
        let margin = -Infinity;
        for (let i = Math.min(leftLines.length, rightLines.length); i--;) {
          margin = Math.max(margin, 3 - leftLines[i].match(/ *$/)[0].length - rightLines[i].match(/^ */)[0].length);
        }
        let line0 = thisInt;
        let line1 = "";
        let expands = leftLines[0].match(/_* *$/)[0].length + margin + rightLines[0].match(/^ *_*/)[0].length - 2;
        if (expands < line0.length) {
          margin += line0.length - expands;
          expands = line0.length;
        } else {
          if ((expands - line0.length) % 2 === 1) {
            margin += 1;
            expands += 1;
          }
          let us = "_".repeat((expands - line0.length) / 2);
          line0 = us + line0 + us;
        }
        if (-margin > leftLines[0].length) {
          leftLines = leftLines.map(line => line.padStart(-margin));
        } else if (-margin > rightLines[0].length) {
          rightLines = rightLines.map(line => line.padEnd(-margin));
        }
        line0 = " " + line0 + " ";
        line1 = "/" + " ".repeat(expands) + "\\";
        let ls = " ".repeat(leftLines[0].match(/^ *_*\d+/)[0].length);
        let rs = " ".repeat(rightLines[0].match(/\d+_* *$/)[0].length);
        line0 = ls + line0 + rs;
        line1 = ls + line1 + rs;
        const thisLines = [line0, line1];
        const width = line0.length;
        for (let i = 0, len = Math.max(leftLines.length, rightLines.length); i < len; i++) {
          let ll = (leftLines[i] || "").replace(/ *$/, "");
          let rl = (rightLines[i] || "").replace(/^ */, "");
          thisLines.push(ll + " ".repeat(width - ll.length - rl.length) + rl);
        }
        return thisLines;
      }
    }
    const lines = getLines(this) || ["0"];
    return lines.join("\n") + "\n";
  }

  printh() {
    function silver(x) {
      return Math.round((x * Math.SQRT1_2) * 1e6) / 1e6;
    }
    // dir: [up right down left]
    function getPath(n, dir, size) {
      let d = "";
      if (n.isNull) return d;
      d += "vh"[dir & 1] + (1 - (dir & 2)) * size;
      d += getPath(n.left, (dir + 1) & 3, silver(size));
      d += getPath(n.right, (dir + 3) & 3, silver(size));
      d += "vh"[dir & 1] + ((dir & 2) - 1) * size;
      return d;
    }
    const width = this.height() * 40;
    const height = silver(width);
    const path = getPath(this, 2, height / 2);
    return `<svg width="${width}" height="${height}"><path d="M${width / 2} ${height}${path}" stroke="black"/></svg>`;
  }

  printz() {
    const lines = [];
    let space = 0;
    function put(n, idx) {
      if (n.isNull) return;
      lines[idx] = (lines[idx] || "").padEnd(space) + "/";
      space++;
      put(n.left, idx + 1);
      lines[idx] = lines[idx].padEnd(space) + "\\";
      space++;
      put(n.right, idx);
    }
    put(this, 0);
    return lines.reverse().join("\n") + "\n";
  }

  printc() {
    const sr = 90;
    const dr = 4;
    const WIDTH = (sr + dr * this.height()) * 2;
    const HEIGHT = WIDTH;
    const { sin, cos, PI } = Math;
    const TAU = PI * 2;
    function polar(radius, turn) {
      let x = radius * cos(turn);
      let y = radius * sin(turn);
      return `${x} ${y}`;
    }
    function normalize(turn) {
      return (turn % TAU + TAU) % TAU;
    }
    let d = "";
    let curr = [
      { node: this, r: sr, theta: TAU / 4 }
    ];
    while (curr.length) {
      let next = [];
      curr = curr.filter(({ node }) => !node.left.isNull || !node.right.isNull);
      curr.forEach(({ node, r: r0, theta: theta0 }, idx) => {
        let r1 = r0 + dr;
        d += `M ${polar(r0, theta0)}\n`;
        d += `L ${polar(r1, theta0)}\n`;
        if (!node.left.isNull) {
          let neighbor = curr[(idx - 1 + curr.length) % curr.length];
          let delta = normalize(neighbor.theta - theta0);
          if (delta < 1e-15) delta = TAU;
          delta = neighbor.node.right.isNull
            ? delta / 2
            : delta / 4;
          let theta1 = normalize(theta0 + delta);
          d += `M ${polar(r1, theta0)}\n`;
          d += `A ${r1} ${r1} ${theta0} 0 1 ${polar(r1, theta1)}\n`;
          next.push({
            node: node.left,
            r: r1,
            theta: theta1
          });
        }
        if (!node.right.isNull) {
          let neighbor = curr[(idx + 1) % curr.length];
          let delta = normalize(theta0 - neighbor.theta);
          if (delta < 1e-15) delta = TAU;
          delta = neighbor.node.left.isNull
            ? delta / 2
            : delta / 4;
          let theta1 = normalize(theta0 - delta);
          d += `M ${polar(r1, theta0)}\n`;
          d += `A ${r1} ${r1} ${theta0} 0 0 ${polar(r1, theta1)}\n`;
          next.push({
            node: node.right,
            r: r1,
            theta: theta1
          });
        }
      });
      curr = next;
    }
    return `<svg
      width="${WIDTH}"
      height="${HEIGHT}"
      viewBox="${-WIDTH / 2}, ${-HEIGHT / 2}, ${WIDTH}, ${HEIGHT}"
    >
      <circle cx="0" cy="0" r="${sr}" stroke="black" fill="none"/>
      <path d="${d}" stroke-linecap="round" stroke="black" fill="none"/>
    </svg>`;
  }
}
