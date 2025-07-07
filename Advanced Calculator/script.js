document.addEventListener("DOMContentLoaded", () => {
  const displayEl = document.getElementById("display");
  const buttonsEl = document.getElementById("buttons");
  const colorPicker = document.getElementById("colorPicker");

  let memory = 0;
  let expression = "";
  let isError = false;

  // Utility: Update display with value or error style
  function updateDisplay(text, error = false) {
    displayEl.textContent = text;
    displayEl.style.color = error ? "red" : "";
  }

  // Clean & interpret expression safely
  function evaluateExpression(expr) {
    try {
      const sanitized = expr
        .replace(/π/g, "Math.PI")
        .replace(/e/g, "Math.E")
        .replace(/√\(([^()]+)\)/g, "Math.sqrt($1)")
        .replace(/∛\(([^()]+)\)/g, "Math.cbrt($1)")
        .replace(/(\d+(\.\d+)?|\([^()]+\))²/g, "Math.pow($1,2)")
        .replace(/(\d+(\.\d+)?|\([^()]+\))³/g, "Math.pow($1,3)")
        .replace(/(\d+(\.\d+)?|\([^()]+\))\^(\d+(\.\d+)?|\([^()]+\))/g, "Math.pow($1,$3)")
        .replace(/sin\(([^)]+)\)/g, "Math.sin($1 * Math.PI / 180)")
        .replace(/cos\(([^)]+)\)/g, "Math.cos($1 * Math.PI / 180)")
        .replace(/tan\(([^)]+)\)/g, "Math.tan($1 * Math.PI / 180)")
        .replace(/log\(([^)]+)\)/g, "Math.log10($1)")
        .replace(/ln\(([^)]+)\)/g, "Math.log($1)");

      const result = Function(`"use strict"; return (${sanitized})`)();
      if (!isFinite(result)) throw new Error("Non-finite");
      return Math.round(result * 1e12) / 1e12;
    } catch {
      return "Error";
    }
  }

  // Handle button clicks centrally
  buttonsEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    if (isError && btn.dataset.func !== "AC") return; // Only AC resets error

    btn.classList.add("button-pressed");
    setTimeout(() => btn.classList.remove("button-pressed"), 150);

    const val = btn.dataset.value;
    const fn = btn.dataset.func;

    if (val) {
      expression += val;
      updateDisplay(expression);
      return;
    }
    if (fn) {
      switch (fn) {
        case "=":
          const out = evaluateExpression(expression);
          if (out === "Error") {
            isError = true;
            updateDisplay("Error", true);
            expression = "";
          } else {
            expression = out.toString();
            updateDisplay(expression);
          }
          break;

        case "AC":
          expression = "";
          isError = false;
          updateDisplay("0");
          break;

        case "DEL":
          expression = expression.slice(0, -1);
          updateDisplay(expression || "0");
          break;

        case "MC":
          memory = 0;
          break;

        case "MR":
          expression += memory;
          updateDisplay(expression);
          break;

        case "M+":
          memory += Number(evaluateExpression(expression) || 0);
          break;

        case "M-":
          memory -= Number(evaluateExpression(expression) || 0);
          break;

        case "sqrt":
          expression += "√(";
          updateDisplay(expression);
          break;

        case "cbrt":
          expression += "∛(";
          updateDisplay(expression);
          break;

        case "square":
          expression += "²";
          updateDisplay(expression);
          break;

        case "cube":
          expression += "³";
          updateDisplay(expression);
          break;

        case "^":
          expression += "^";
          updateDisplay(expression);
          break;

        // Prefix functions: add parentheses where needed
        case "π":
        case "e":
          expression += fn;
          updateDisplay(expression);
          break;

        case "sin":
        case "cos":
        case "tan":
        case "log":
        case "ln":
          expression += `${fn}(`;
          updateDisplay(expression);
          break;

        case "(":
        case ")":
          expression += fn;
          updateDisplay(expression);
          break;

        default:
          console.warn("Unhandled func:", fn);
      }
    }
  });

  // Theme picker handling
  colorPicker.addEventListener("change", (e) => {
    document.body.className = `theme-${e.target.value}`;
  });

  // Init default
  document.body.className = `theme-${colorPicker.value}`;
  updateDisplay("0");
});
