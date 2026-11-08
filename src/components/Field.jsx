import React from "react";
export function Field({ name, label, error, as = "input", ...props }) {
  const Tag = as;
  return (
    <div className="mb-3">
      <label className="form-label" htmlFor={name}>
        {label}
      </label>
      <Tag
        id={name}
        name={name}
        className={`form-control ${error ? "is-invalid" : ""}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? name + "-error" : undefined}
        {...props}
      />
      {error && (
        <div id={name + "-error"} className="invalid-feedback" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
