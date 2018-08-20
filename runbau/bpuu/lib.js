Big.DP = 0;
Big.RM = 0;

const mappings = [
  // kolmio
  {
    ii2i(x, y) {
      // (x+y)(x+y+1)/2+y+1
      return x.plus(y).times(x.plus(y).plus(1)).div(2).plus(y).plus(1);
    },
    i2ii(z) {
      // (sqrt(8z-7)-1)/2+1
      const m = z.times(8).minus(7).sqrt().minus(1).div(2).plus(1);
      return [
        // m(m+1)/2-z
        m.times(m.plus(1)).div(2).minus(z),
        // z-(m-1)m/2-1
        z.minus(m.minus(1).times(m).div(2)).minus(1)
      ];
    },
  },
  // neliö
  {
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
  },
];

let mapping = mappings[0];

class Node {
  constructor(...args) {
    this.isNull = args.length === 0;
    this.left = args[0] || null;
    this.right = args[1] || null;
    Object.freeze(this);
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
          margin = Math.max(margin, 2 - leftLines[i].match(/ *$/)[0].length - rightLines[i].match(/^ */)[0].length);
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
}
