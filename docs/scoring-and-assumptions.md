# Scoring and Assumptions

## Technical score

The Technical Evaluation Engine checks whether the answer correctly explains the concept, includes role-specific details, and addresses the expected depth.

Example factors:

- Correctness of explanation
- Use of relevant technical terms
- Project-specific understanding
- Ability to explain trade-offs
- Completeness of answer

## Depth score

Depth score measures whether the candidate only gives a surface-level answer or explains implementation details.

Example:

- Low depth: "JWT is used for login."
- Better depth: "JWT is generated after login, sent in the Authorization header, verified by middleware, and used to protect private routes."

## Communication clarity score

Communication clarity considers:

- Answer structure
- Filler words
- Hesitation
- Speaking rate
- Whether the response is understandable

## Confidence score

Confidence score is estimated using:

- Answer length
- Hesitation count
- Pause count
- Filler words
- Speaking consistency

## Visual engagement score

Visual engagement uses webcam-based indicators:

- Face visible
- Eye contact estimate
- Looking away/down
- Posture estimate
- Attention/stress flags

## Final aggregation

The final feedback does not rely on only one score. It combines:

```text
Technical + Depth + Communication + Confidence + Visual Engagement
```

The output is explainable so the candidate can understand what to improve.
