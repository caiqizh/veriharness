// Extracted from the approved paper; see tools/update_paper.py.
const PAPER_DATA = {
  "models": {
    "gemini": {
      "name": "Gemini 3.5 Flash",
      "rows": [
        {
          "name": "Single rollout",
          "key": "single",
          "group": "Primary selection comparison",
          "avg": 47.2,
          "values": [
            {
              "mean": 48.1,
              "std": null
            },
            {
              "mean": 56.5,
              "std": null
            },
            {
              "mean": 73.2,
              "std": null
            },
            {
              "mean": 27.3,
              "std": null
            },
            {
              "mean": 30.9,
              "std": null
            }
          ]
        },
        {
          "name": "Majority voting",
          "key": "majority",
          "group": "Primary selection comparison",
          "avg": 47.5,
          "values": [
            {
              "mean": 47.3,
              "std": 0.4
            },
            {
              "mean": 57.0,
              "std": 1.8
            },
            {
              "mean": 74.0,
              "std": 1.0
            },
            {
              "mean": 27.0,
              "std": 1.3
            },
            {
              "mean": 32.4,
              "std": 0.5
            }
          ]
        },
        {
          "name": "Best-of-N with judge",
          "key": "best_of_n",
          "group": "Primary selection comparison",
          "avg": 47.3,
          "values": [
            {
              "mean": 47.2,
              "std": 0.4
            },
            {
              "mean": 57.0,
              "std": 2.1
            },
            {
              "mean": 73.6,
              "std": 1.2
            },
            {
              "mean": 27.7,
              "std": 0.3
            },
            {
              "mean": 30.9,
              "std": 0.9
            }
          ]
        },
        {
          "name": "Pairwise tournament",
          "key": "pairwise",
          "group": "Primary selection comparison",
          "avg": 49.1,
          "values": [
            {
              "mean": 49.2,
              "std": 1.4
            },
            {
              "mean": 59.6,
              "std": 1.0
            },
            {
              "mean": 74.8,
              "std": 0.8
            },
            {
              "mean": 30.4,
              "std": 0.7
            },
            {
              "mean": 31.4,
              "std": 1.5
            }
          ]
        },
        {
          "name": "LLM-as-a-Verifier",
          "key": "llm_verifier",
          "group": "Primary selection comparison",
          "avg": 49.5,
          "values": [
            {
              "mean": 49.8,
              "std": 0.5
            },
            {
              "mean": 60.4,
              "std": 0.2
            },
            {
              "mean": 75.3,
              "std": 0.5
            },
            {
              "mean": 30.2,
              "std": 0.5
            },
            {
              "mean": 31.9,
              "std": 1.2
            }
          ]
        },
        {
          "name": "Agentic verifier (env. access)",
          "key": "agentic",
          "group": "Primary selection comparison",
          "avg": 49.4,
          "values": [
            {
              "mean": 49.0,
              "std": 0.8
            },
            {
              "mean": 60.1,
              "std": 1.3
            },
            {
              "mean": 75.1,
              "std": 0.9
            },
            {
              "mean": 30.9,
              "std": 1.1
            },
            {
              "mean": 31.8,
              "std": 1.4
            }
          ]
        },
        {
          "name": "VeriHarness (select)",
          "key": "ours_select",
          "group": "Primary selection comparison",
          "avg": 51.6,
          "values": [
            {
              "mean": 53.3,
              "std": 1.2
            },
            {
              "mean": 62.0,
              "std": 0.9
            },
            {
              "mean": 77.8,
              "std": 1.4
            },
            {
              "mean": 31.5,
              "std": 2.4
            },
            {
              "mean": 33.5,
              "std": 1.8
            }
          ],
          "gain": {
            "avg": 4.4,
            "values": [
              5.2,
              5.5,
              4.6,
              4.2,
              2.6
            ]
          }
        },
        {
          "name": "VeriHarness in Gemini CLI",
          "key": "cli_gemini",
          "group": "CLI deployments",
          "avg": 51.5,
          "values": [
            {
              "mean": 51.3,
              "std": 1.1
            },
            {
              "mean": 63.2,
              "std": 1.1
            },
            {
              "mean": 77.6,
              "std": 0.8
            },
            {
              "mean": 31.5,
              "std": 1.0
            },
            {
              "mean": 33.8,
              "std": 1.2
            }
          ]
        },
        {
          "name": "VeriHarness in Codex",
          "key": "cli_codex",
          "group": "CLI deployments",
          "avg": 51.4,
          "values": [
            {
              "mean": 51.5,
              "std": 1.1
            },
            {
              "mean": 63.8,
              "std": 1.1
            },
            {
              "mean": 75.8,
              "std": 1.1
            },
            {
              "mean": 30.5,
              "std": 1.1
            },
            {
              "mean": 35.6,
              "std": 1.3
            }
          ]
        },
        {
          "name": "Selection oracle",
          "key": "oracle",
          "group": "Selection oracle (grader-informed)",
          "avg": 62.7,
          "values": [
            {
              "mean": 67.3,
              "std": null
            },
            {
              "mean": 70.3,
              "std": null
            },
            {
              "mean": 87.7,
              "std": null
            },
            {
              "mean": 37.4,
              "std": null
            },
            {
              "mean": 51.0,
              "std": null
            }
          ]
        },
        {
          "name": "Aggregation over the pool",
          "key": "aggregation",
          "group": "With revision",
          "avg": 49.9,
          "values": [
            {
              "mean": 49.6,
              "std": 1.0
            },
            {
              "mean": 60.9,
              "std": 1.5
            },
            {
              "mean": 74.4,
              "std": 1.1
            },
            {
              "mean": 29.0,
              "std": 1.2
            },
            {
              "mean": 35.6,
              "std": 1.6
            }
          ]
        },
        {
          "name": "Agentic verifier + revision",
          "key": "agentic_revision",
          "group": "With revision",
          "avg": 50.7,
          "values": [
            {
              "mean": 50.5,
              "std": 1.0
            },
            {
              "mean": 62.0,
              "std": 1.5
            },
            {
              "mean": 76.0,
              "std": 1.0
            },
            {
              "mean": 31.0,
              "std": 1.2
            },
            {
              "mean": 34.0,
              "std": 1.5
            }
          ]
        },
        {
          "name": "VeriHarness",
          "key": "ours_revision",
          "group": "With revision",
          "avg": 53.4,
          "values": [
            {
              "mean": 54.8,
              "std": 1.0
            },
            {
              "mean": 65.4,
              "std": 1.0
            },
            {
              "mean": 78.2,
              "std": 0.2
            },
            {
              "mean": 32.2,
              "std": 0.6
            },
            {
              "mean": 36.2,
              "std": 1.1
            }
          ],
          "gain": {
            "avg": 6.2,
            "values": [
              6.7,
              8.9,
              5.0,
              4.9,
              5.3
            ]
          }
        }
      ]
    },
    "opus": {
      "name": "Claude Opus 4.8",
      "rows": [
        {
          "name": "Single rollout",
          "key": "single",
          "group": "Primary selection comparison",
          "avg": 49.6,
          "values": [
            {
              "mean": 35.8,
              "std": null
            },
            {
              "mean": 60.5,
              "std": null
            },
            {
              "mean": 79.0,
              "std": null
            },
            {
              "mean": 30.1,
              "std": null
            },
            {
              "mean": 42.8,
              "std": null
            }
          ]
        },
        {
          "name": "Majority voting",
          "key": "majority",
          "group": "Primary selection comparison",
          "avg": 50.4,
          "values": [
            {
              "mean": 38.0,
              "std": 0.2
            },
            {
              "mean": 62.0,
              "std": 0.7
            },
            {
              "mean": 79.3,
              "std": 0.7
            },
            {
              "mean": 29.5,
              "std": 0.5
            },
            {
              "mean": 43.3,
              "std": 1.5
            }
          ]
        },
        {
          "name": "Best-of-N with judge",
          "key": "best_of_n",
          "group": "Primary selection comparison",
          "avg": 50.6,
          "values": [
            {
              "mean": 38.4,
              "std": 0.4
            },
            {
              "mean": 62.8,
              "std": 0.3
            },
            {
              "mean": 79.2,
              "std": 1.1
            },
            {
              "mean": 30.5,
              "std": 0.0
            },
            {
              "mean": 42.3,
              "std": 1.9
            }
          ]
        },
        {
          "name": "Pairwise tournament",
          "key": "pairwise",
          "group": "Primary selection comparison",
          "avg": 51.3,
          "values": [
            {
              "mean": 38.4,
              "std": 1.1
            },
            {
              "mean": 63.1,
              "std": 0.7
            },
            {
              "mean": 80.5,
              "std": 1.4
            },
            {
              "mean": 31.4,
              "std": 0.7
            },
            {
              "mean": 42.9,
              "std": 0.9
            }
          ]
        },
        {
          "name": "LLM-as-a-Verifier",
          "key": "llm_verifier",
          "group": "Primary selection comparison",
          "avg": 51.2,
          "values": [
            {
              "mean": 36.7,
              "std": 0.8
            },
            {
              "mean": 62.4,
              "std": 0.2
            },
            {
              "mean": 81.7,
              "std": 0.3
            },
            {
              "mean": 30.2,
              "std": 0.3
            },
            {
              "mean": 45.0,
              "std": 1.8
            }
          ]
        },
        {
          "name": "Agentic verifier (env. access)",
          "key": "agentic",
          "group": "Primary selection comparison",
          "avg": 51.6,
          "values": [
            {
              "mean": 38.1,
              "std": 0.9
            },
            {
              "mean": 63.4,
              "std": 0.6
            },
            {
              "mean": 80.9,
              "std": 0.7
            },
            {
              "mean": 31.8,
              "std": 0.8
            },
            {
              "mean": 43.9,
              "std": 1.3
            }
          ]
        },
        {
          "name": "VeriHarness (select)",
          "key": "ours_select",
          "group": "Primary selection comparison",
          "avg": 53.7,
          "values": [
            {
              "mean": 41.2,
              "std": 0.7
            },
            {
              "mean": 65.0,
              "std": 0.5
            },
            {
              "mean": 83.0,
              "std": 0.4
            },
            {
              "mean": 33.4,
              "std": 1.2
            },
            {
              "mean": 46.1,
              "std": 0.8
            }
          ],
          "gain": {
            "avg": 4.1,
            "values": [
              5.4,
              4.5,
              4.0,
              3.3,
              3.3
            ]
          }
        },
        {
          "name": "VeriHarness in Claude Code",
          "key": "cli_claude",
          "group": "CLI deployments",
          "avg": 51.7,
          "values": [
            {
              "mean": 39.0,
              "std": 1.1
            },
            {
              "mean": 64.9,
              "std": 1.3
            },
            {
              "mean": 81.5,
              "std": 0.9
            },
            {
              "mean": 30.9,
              "std": 1.0
            },
            {
              "mean": 42.4,
              "std": 1.4
            }
          ]
        },
        {
          "name": "VeriHarness in Codex",
          "key": "cli_codex",
          "group": "CLI deployments",
          "avg": 52.2,
          "values": [
            {
              "mean": 38.4,
              "std": 1.1
            },
            {
              "mean": 63.9,
              "std": 1.2
            },
            {
              "mean": 81.8,
              "std": 0.9
            },
            {
              "mean": 33.1,
              "std": 1.0
            },
            {
              "mean": 43.6,
              "std": 1.5
            }
          ]
        },
        {
          "name": "Selection oracle",
          "key": "oracle",
          "group": "Selection oracle (grader-informed)",
          "avg": 63.1,
          "values": [
            {
              "mean": 53.8,
              "std": null
            },
            {
              "mean": 72.4,
              "std": null
            },
            {
              "mean": 89.4,
              "std": null
            },
            {
              "mean": 39.6,
              "std": null
            },
            {
              "mean": 60.4,
              "std": null
            }
          ]
        },
        {
          "name": "Aggregation over the pool",
          "key": "aggregation",
          "group": "With revision",
          "avg": 52.3,
          "values": [
            {
              "mean": 40.2,
              "std": 1.1
            },
            {
              "mean": 63.5,
              "std": 0.8
            },
            {
              "mean": 80.8,
              "std": 0.9
            },
            {
              "mean": 30.9,
              "std": 0.7
            },
            {
              "mean": 45.9,
              "std": 1.4
            }
          ]
        },
        {
          "name": "Agentic verifier + revision",
          "key": "agentic_revision",
          "group": "With revision",
          "avg": 53.1,
          "values": [
            {
              "mean": 42.0,
              "std": 1.0
            },
            {
              "mean": 64.5,
              "std": 0.8
            },
            {
              "mean": 82.0,
              "std": 0.7
            },
            {
              "mean": 32.0,
              "std": 1.0
            },
            {
              "mean": 45.0,
              "std": 1.3
            }
          ]
        },
        {
          "name": "VeriHarness",
          "key": "ours_revision",
          "group": "With revision",
          "avg": 56.1,
          "values": [
            {
              "mean": 47.5,
              "std": 0.2
            },
            {
              "mean": 67.3,
              "std": 0.2
            },
            {
              "mean": 83.7,
              "std": 0.7
            },
            {
              "mean": 34.3,
              "std": 0.2
            },
            {
              "mean": 47.6,
              "std": 0.5
            }
          ],
          "gain": {
            "avg": 6.4,
            "values": [
              11.7,
              6.8,
              4.7,
              4.2,
              4.8
            ]
          }
        }
      ]
    }
  },
  "libraries": {
    "apex": [
      38.6,
      45.3,
      49.6,
      52.1
    ],
    "sb2": [
      32.8,
      35.7,
      38.5,
      39.4
    ]
  }
};
