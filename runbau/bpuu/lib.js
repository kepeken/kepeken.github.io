Big.DP = 0;
Big.RM = 0;

const mapping = {
  // N -> N * N
  i2ii(i) {
    // (sqrt(8n-7)-1)/2+1
    const m = i.times(8).minus(7).sqrt().minus(1).div(2).plus(1);
    return [
      // m(m+1)/2-i
      m.times(m.plus(1)).div(2).minus(i),
      // i-(m-1)m/2-1
      i.minus(m.minus(1).times(m).div(2)).minus(1)
    ];
  },
  // N * N -> N
  ii2i(i, j) {
    // (i+j)(i+j+1)/2+j+1
    return i.plus(j).times(i.plus(j).plus(1)).div(2).plus(j).plus(1);
  }
};

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
    /**
     * @param {Node} n
     * @return {[number,string[]]}
     */
    function info(n) {
      if (n.isNull) return [Big(0), ["0"]];
      if (n.left.isNull && n.right.isNull) return [Big(1), ["1"]];
      const
        [leftInt, leftLines] = info(n.left),
        [rightInt, rightLines] = info(n.right),
        thisInt = mapping.ii2i(leftInt, rightInt);
      let margin = -Infinity;
      for (let i = Math.min(leftLines.length, rightLines.length); i--;) {
        margin = Math.max(margin, 2 - leftLines[i].match(/ *$/)[0].length - rightLines[i].match(/^ */)[0].length);
      }
      let line0 = thisInt.toFixed();
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
      line1 = "/" + " ".repeat(expands) + "\\";
      let ls = " ".repeat(leftLines[0].match(/^ *_*\d+/)[0].length);
      let rs = " ".repeat(rightLines[0].match(/\d+_* *$/)[0].length);
      line0 = ls + " " + line0 + " " + rs;
      line1 = ls + line1 + rs;
      let thisLines = [line0, line1];
      const width = line0.length;
      for (let i = 0, len = Math.max(leftLines.length, rightLines.length); i < len; i++) {
        let ll = (leftLines[i] || "").replace(/ *$/, "");
        let rl = (rightLines[i] || "").replace(/^ */, "");
        console.log(width, ll, rl, thisInt.toFixed());
        thisLines.push(ll + " ".repeat(width - ll.length - rl.length) + rl);
      }
      return [thisInt, thisLines];
    }
    const [, lines] = info(this);
    return lines.join("\n") + "\n";
  }
}
