export const TOPICS = [
  { id: 'array', label: 'Arrays', icon: '▦' },
  { id: 'string', label: 'Strings', icon: '✦' },
  { id: 'tree', label: 'Trees', icon: '⬡' },
  { id: 'dp', label: 'Dynamic Programming', icon: '◈' },
  { id: 'graph', label: 'Graphs', icon: '⬟' },
  { id: 'linked', label: 'Linked List', icon: '⬦' },
  { id: 'sliding', label: 'Sliding Window', icon: '▬' },
  { id: 'binary', label: 'Binary Search', icon: '⊕' },
  { id: 'stack', label: 'Stack & Queue', icon: '⊞' },
  { id: 'heap', label: 'Heap', icon: '△' },
];

export const LANGUAGE_CONFIG = {
  javascript: { id: 63, name: 'JavaScript (Node.js 12.14.0)', ext: 'js', monacoLang: 'javascript' },
  python:     { id: 71, name: 'Python (3.8.1)',               ext: 'py', monacoLang: 'python' },
  java:       { id: 62, name: 'Java (OpenJDK 13.0.1)',        ext: 'java', monacoLang: 'java' },
  cpp:        { id: 54, name: 'C++ (GCC 9.2.0)',              ext: 'cpp', monacoLang: 'cpp' },
  typescript: { id: 74, name: 'TypeScript (3.7.4)',           ext: 'ts', monacoLang: 'typescript' },
  go:         { id: 60, name: 'Go (1.13.5)',                  ext: 'go', monacoLang: 'go' },
};

export const QUESTIONS = [
  // ─── ARRAYS ────────────────────────────────────────────────────────────────
  {
    id: 1, topic: 'array', title: 'Two Sum', difficulty: 'easy', solved: 'solved',
    desc: `Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices</em> of the two numbers such that they add up to <code>target</code>.<br/><br/>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.`,
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explain: 'nums[0] + nums[1] == 9, return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
      { input: 'nums = [3,3], target = 6', output: '[0,1]' },
    ],
    constraints: ['2 ≤ nums.length ≤ 10⁴', '−10⁹ ≤ nums[i] ≤ 10⁹', 'Only one valid answer exists'],
    timeComplexity: 'O(n)', spaceComplexity: 'O(n)',
    hints: [
      'A brute-force solution is O(n²). Can you do better?',
      'Think about using a hash map to track values you\'ve seen.',
      'For each element x, check if target − x already exists in the map.',
    ],
    starterCode: {
      javascript: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    \n};\n`,
      python: `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        pass\n`,
      java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}\n`,
      cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};\n`,
      typescript: `function twoSum(nums: number[], target: number): number[] {\n    \n};\n`,
      go: `func twoSum(nums []int, target int) []int {\n    \n}\n`,
    },
    solutionCode: {
      javascript: `function twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const comp = target - nums[i];\n        if (map.has(comp)) return [map.get(comp), i];\n        map.set(nums[i], i);\n    }\n}`,
      python: `class Solution:\n    def twoSum(self, nums, target):\n        seen = {}\n        for i, v in enumerate(nums):\n            if target - v in seen:\n                return [seen[target - v], i]\n            seen[v] = i`,
    },
    testCases: [
      { input: [[2,7,11,15], 9], expected: [0,1] },
      { input: [[3,2,4], 6],     expected: [1,2] },
      { input: [[3,3], 6],       expected: [0,1] },
    ],
    runnerCode: {
      javascript: `const result = twoSum({INPUT0}, {INPUT1});\nif (JSON.stringify(result) === JSON.stringify({EXPECTED})) console.log("PASS"); else console.log("FAIL: got " + JSON.stringify(result));`,
    },
    vizType: 'array', vizData: [2,7,11,15],
    algoSteps: ['Initialize empty hash map','Iterate index i through nums','Compute complement = target − nums[i]','If complement in map → return [map[complement], i]','Else store map[nums[i]] = i'],
  },
  {
    id: 2, topic: 'array', title: 'Best Time to Buy & Sell Stock', difficulty: 'easy', solved: 'none',
    desc: `You are given an array <code>prices</code> where <code>prices[i]</code> is the price of a given stock on the <code>i</code>th day.<br/><br/>You want to maximize your profit by choosing a <strong>single day</strong> to buy and a <strong>different day in the future</strong> to sell. Return the maximum profit. If no profit, return <code>0</code>.`,
    examples: [
      { input: 'prices = [7,1,5,3,6,4]', output: '5', explain: 'Buy on day 2 (price=1), sell on day 5 (price=6).' },
      { input: 'prices = [7,6,4,3,1]', output: '0', explain: 'No profitable transaction possible.' },
    ],
    constraints: ['1 ≤ prices.length ≤ 10⁵', '0 ≤ prices[i] ≤ 10⁴'],
    timeComplexity: 'O(n)', spaceComplexity: 'O(1)',
    hints: ['Track the minimum price seen so far.','At each index, profit = prices[i] − minPrice.','Keep a running maximum of profit.'],
    starterCode: {
      javascript: `/**\n * @param {number[]} prices\n * @return {number}\n */\nfunction maxProfit(prices) {\n    \n};\n`,
      python: `class Solution:\n    def maxProfit(self, prices: list[int]) -> int:\n        pass\n`,
      java: `class Solution {\n    public int maxProfit(int[] prices) {\n        \n    }\n}\n`,
      cpp: `class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        \n    }\n};\n`,
    },
    solutionCode: {
      javascript: `function maxProfit(prices) {\n    let min = Infinity, max = 0;\n    for (const p of prices) {\n        min = Math.min(min, p);\n        max = Math.max(max, p - min);\n    }\n    return max;\n}`,
    },
    testCases: [
      { input: [[7,1,5,3,6,4]], expected: 5 },
      { input: [[7,6,4,3,1]],   expected: 0 },
    ],
    vizType: 'array', vizData: [7,1,5,3,6,4],
    algoSteps: ['Set minPrice = Infinity, maxProfit = 0','For each price p:','  minPrice = min(minPrice, p)','  maxProfit = max(maxProfit, p − minPrice)','Return maxProfit'],
  },
  {
    id: 3, topic: 'array', title: 'Contains Duplicate', difficulty: 'easy', solved: 'none',
    desc: `Given an integer array <code>nums</code>, return <code>true</code> if any value appears <strong>at least twice</strong> in the array, and return <code>false</code> if every element is distinct.`,
    examples: [
      { input: 'nums = [1,2,3,1]', output: 'true' },
      { input: 'nums = [1,2,3,4]', output: 'false' },
    ],
    constraints: ['1 ≤ nums.length ≤ 10⁵', '−10⁹ ≤ nums[i] ≤ 10⁹'],
    timeComplexity: 'O(n)', spaceComplexity: 'O(n)',
    hints: ['A Set only stores unique elements.','If adding an element to the Set doesn\'t change its size, it\'s a duplicate.'],
    starterCode: {
      javascript: `function containsDuplicate(nums) {\n    \n};\n`,
      python: `class Solution:\n    def containsDuplicate(self, nums: list[int]) -> bool:\n        pass\n`,
      java: `class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        \n    }\n}\n`,
      cpp: `class Solution {\npublic:\n    bool containsDuplicate(vector<int>& nums) {\n        \n    }\n};\n`,
    },
    solutionCode: { javascript: `function containsDuplicate(nums) {\n    return new Set(nums).size !== nums.length;\n}` },
    testCases: [
      { input: [[1,2,3,1]], expected: true },
      { input: [[1,2,3,4]], expected: false },
    ],
    vizType: 'array', vizData: [1,2,3,1],
    algoSteps: ['Create an empty Set','For each num in nums:','  If num in Set → return true','  Else add num to Set','Return false'],
  },

  // ─── STRINGS ───────────────────────────────────────────────────────────────
  {
    id: 4, topic: 'string', title: 'Valid Anagram', difficulty: 'easy', solved: 'none',
    desc: `Given two strings <code>s</code> and <code>t</code>, return <code>true</code> if <code>t</code> is an anagram of <code>s</code>, and <code>false</code> otherwise.<br/><br/>An <strong>anagram</strong> is a word or phrase formed by rearranging the letters of a different word.`,
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: 'true' },
      { input: 's = "rat", t = "car"', output: 'false' },
    ],
    constraints: ['1 ≤ s.length, t.length ≤ 5 × 10⁴', 's and t consist of lowercase English letters'],
    timeComplexity: 'O(n)', spaceComplexity: 'O(1)',
    hints: ['If lengths differ → false immediately.','Use a 26-element frequency array (one per letter).','Increment for s, decrement for t; check all zeros.'],
    starterCode: {
      javascript: `function isAnagram(s, t) {\n    \n};\n`,
      python: `class Solution:\n    def isAnagram(self, s: str, t: str) -> bool:\n        pass\n`,
      java: `class Solution {\n    public boolean isAnagram(String s, String t) {\n        \n    }\n}\n`,
      cpp: `class Solution {\npublic:\n    bool isAnagram(string s, string t) {\n        \n    }\n};\n`,
    },
    solutionCode: { javascript: `function isAnagram(s, t) {\n    if (s.length !== t.length) return false;\n    const freq = {};\n    for (const c of s) freq[c] = (freq[c] || 0) + 1;\n    for (const c of t) {\n        if (!freq[c]) return false;\n        freq[c]--;\n    }\n    return true;\n}` },
    testCases: [
      { input: ['anagram','nagaram'], expected: true },
      { input: ['rat','car'], expected: false },
    ],
    vizType: 'sort', vizData: [3,6,2,8,1,7,4,5],
    algoSteps: ['If lengths differ → return false','Build freq map from string s','For each char in t:','  If not in map or count 0 → false','  Decrement count','Return true'],
  },
  {
    id: 5, topic: 'string', title: 'Valid Palindrome', difficulty: 'easy', solved: 'none',
    desc: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.<br/><br/>Given a string <code>s</code>, return <code>true</code> if it is a palindrome, or <code>false</code> otherwise.`,
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'true', explain: '"amanaplanacanalpanama" is a palindrome.' },
      { input: 's = "race a car"', output: 'false' },
    ],
    constraints: ['1 ≤ s.length ≤ 2 × 10⁵', 's consists only of printable ASCII characters'],
    timeComplexity: 'O(n)', spaceComplexity: 'O(1)',
    hints: ['Use two pointers: left and right.','Skip non-alphanumeric characters.','Compare lowercased characters.'],
    starterCode: {
      javascript: `function isPalindrome(s) {\n    \n};\n`,
      python: `class Solution:\n    def isPalindrome(self, s: str) -> bool:\n        pass\n`,
      java: `class Solution {\n    public boolean isPalindrome(String s) {\n        \n    }\n}\n`,
      cpp: `class Solution {\npublic:\n    bool isPalindrome(string s) {\n        \n    }\n};\n`,
    },
    solutionCode: { javascript: `function isPalindrome(s) {\n    let l = 0, r = s.length - 1;\n    while (l < r) {\n        while (l < r && !/[a-z0-9]/i.test(s[l])) l++;\n        while (l < r && !/[a-z0-9]/i.test(s[r])) r--;\n        if (s[l].toLowerCase() !== s[r].toLowerCase()) return false;\n        l++; r--;\n    }\n    return true;\n}` },
    testCases: [
      { input: ['A man, a plan, a canal: Panama'], expected: true },
      { input: ['race a car'], expected: false },
    ],
    vizType: 'sort', vizData: [1,2,3,3,2,1],
    algoSteps: ['l=0, r=len−1','Skip non-alphanumeric from left','Skip non-alphanumeric from right','If s[l].lower ≠ s[r].lower → false','Move l++, r−−; repeat','Return true'],
  },

  // ─── TREES ─────────────────────────────────────────────────────────────────
  {
    id: 6, topic: 'tree', title: 'Maximum Depth of Binary Tree', difficulty: 'easy', solved: 'none',
    desc: `Given the <code>root</code> of a binary tree, return its <strong>maximum depth</strong>.<br/><br/>A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.`,
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '3' },
      { input: 'root = [1,null,2]', output: '2' },
    ],
    constraints: ['Number of nodes: [0, 10⁴]', '−100 ≤ Node.val ≤ 100'],
    timeComplexity: 'O(n)', spaceComplexity: 'O(h)',
    hints: ['DFS recursion is the cleanest approach.','Base case: null node returns 0.','Return 1 + max(depth(left), depth(right)).'],
    starterCode: {
      javascript: `function maxDepth(root) {\n    \n};\n`,
      python: `class Solution:\n    def maxDepth(self, root) -> int:\n        pass\n`,
      java: `class Solution {\n    public int maxDepth(TreeNode root) {\n        \n    }\n}\n`,
      cpp: `class Solution {\npublic:\n    int maxDepth(TreeNode* root) {\n        \n    }\n};\n`,
    },
    solutionCode: { javascript: `function maxDepth(root) {\n    if (!root) return 0;\n    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));\n}` },
    testCases: [],
    vizType: 'tree', vizData: null,
    algoSteps: ['If root is null → return 0','Recurse on left child','Recurse on right child','Return 1 + max(leftDepth, rightDepth)'],
  },
  {
    id: 7, topic: 'tree', title: 'Invert Binary Tree', difficulty: 'easy', solved: 'none',
    desc: `Given the <code>root</code> of a binary tree, invert the tree, and return its root.`,
    examples: [
      { input: 'root = [4,2,7,1,3,6,9]', output: '[4,7,2,9,6,3,1]' },
    ],
    constraints: ['Number of nodes: [0, 100]', '−100 ≤ Node.val ≤ 100'],
    timeComplexity: 'O(n)', spaceComplexity: 'O(h)',
    hints: ['Swap left and right children.','Recurse on both subtrees.','Works top-down or bottom-up.'],
    starterCode: {
      javascript: `function invertTree(root) {\n    \n};\n`,
      python: `class Solution:\n    def invertTree(self, root):\n        pass\n`,
    },
    solutionCode: { javascript: `function invertTree(root) {\n    if (!root) return null;\n    [root.left, root.right] = [invertTree(root.right), invertTree(root.left)];\n    return root;\n}` },
    testCases: [], vizType: 'tree', vizData: null,
    algoSteps: ['If node is null → return null','Swap left and right children','Recurse on new left','Recurse on new right','Return node'],
  },

  // ─── DP ────────────────────────────────────────────────────────────────────
  {
    id: 8, topic: 'dp', title: 'Climbing Stairs', difficulty: 'easy', solved: 'none',
    desc: `You are climbing a staircase. It takes <code>n</code> steps to reach the top.<br/><br/>Each time you can either climb <strong>1</strong> or <strong>2</strong> steps. In how many distinct ways can you climb to the top?`,
    examples: [
      { input: 'n = 2', output: '2', explain: '1+1, or 2.' },
      { input: 'n = 3', output: '3', explain: '1+1+1, 1+2, 2+1.' },
    ],
    constraints: ['1 ≤ n ≤ 45'],
    timeComplexity: 'O(n)', spaceComplexity: 'O(1)',
    hints: ['This is the Fibonacci sequence in disguise.','ways(n) = ways(n−1) + ways(n−2)','Only store the last two values.'],
    starterCode: {
      javascript: `function climbStairs(n) {\n    \n};\n`,
      python: `class Solution:\n    def climbStairs(self, n: int) -> int:\n        pass\n`,
      java: `class Solution {\n    public int climbStairs(int n) {\n        \n    }\n}\n`,
    },
    solutionCode: { javascript: `function climbStairs(n) {\n    let a = 1, b = 1;\n    for (let i = 2; i <= n; i++) [a, b] = [b, a + b];\n    return b;\n}` },
    testCases: [
      { input: [2], expected: 2 },
      { input: [3], expected: 3 },
      { input: [10], expected: 89 },
    ],
    vizType: 'dp', vizData: [1,1,2,3,5,8,13,21,34,55,89],
    algoSteps: ['dp[1] = 1, dp[2] = 1','For i from 3 to n:','  dp[i] = dp[i−1] + dp[i−2]','Return dp[n]'],
  },
  {
    id: 9, topic: 'dp', title: 'Coin Change', difficulty: 'medium', solved: 'none',
    desc: `You are given an integer array <code>coins</code> representing coins of different denominations and an integer <code>amount</code>.<br/><br/>Return the fewest number of coins needed to make up that amount. If it cannot be done, return <code>-1</code>.`,
    examples: [
      { input: 'coins = [1,5,10,25], amount = 36', output: '3', explain: '25 + 10 + 1 = 36' },
      { input: 'coins = [2], amount = 3', output: '-1' },
    ],
    constraints: ['1 ≤ coins.length ≤ 12', '1 ≤ coins[i] ≤ 2³¹ − 1', '0 ≤ amount ≤ 10⁴'],
    timeComplexity: 'O(n × amount)', spaceComplexity: 'O(amount)',
    hints: ['Build a dp[] array of size amount+1.','dp[i] = min coins to make amount i.','For each coin: dp[i] = min(dp[i], dp[i−coin]+1).'],
    starterCode: {
      javascript: `function coinChange(coins, amount) {\n    \n};\n`,
      python: `class Solution:\n    def coinChange(self, coins: list[int], amount: int) -> int:\n        pass\n`,
    },
    solutionCode: { javascript: `function coinChange(coins, amount) {\n    const dp = Array(amount + 1).fill(Infinity);\n    dp[0] = 0;\n    for (let i = 1; i <= amount; i++)\n        for (const c of coins)\n            if (c <= i) dp[i] = Math.min(dp[i], dp[i - c] + 1);\n    return dp[amount] === Infinity ? -1 : dp[amount];\n}` },
    testCases: [
      { input: [[1,5,10,25], 36], expected: 3 },
      { input: [[2], 3], expected: -1 },
    ],
    vizType: 'dp', vizData: [0,1,2,3,4,1,2,3,4,5,1],
    algoSteps: ['dp[0] = 0; rest = Infinity','For amount i from 1 to target:','  For each coin c:','    If c ≤ i: dp[i] = min(dp[i], dp[i−c]+1)','Return dp[amount] or −1'],
  },

  // ─── BINARY SEARCH ─────────────────────────────────────────────────────────
  {
    id: 10, topic: 'binary', title: 'Binary Search', difficulty: 'easy', solved: 'none',
    desc: `Given an array of integers <code>nums</code> which is sorted in ascending order, and an integer <code>target</code>, write a function to search <code>target</code> in <code>nums</code>. If target exists, return its index; otherwise return <code>-1</code>.`,
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1' },
    ],
    constraints: ['1 ≤ nums.length ≤ 10⁴', 'All integers unique', 'nums sorted ascending', '−10⁴ ≤ nums[i], target ≤ 10⁴'],
    timeComplexity: 'O(log n)', spaceComplexity: 'O(1)',
    hints: ['Use two pointers: l=0, r=len−1.','mid = (l+r) >>> 1 avoids integer overflow.','If nums[mid] < target → l = mid+1; else r = mid−1.'],
    starterCode: {
      javascript: `function search(nums, target) {\n    \n};\n`,
      python: `class Solution:\n    def search(self, nums: list[int], target: int) -> int:\n        pass\n`,
    },
    solutionCode: { javascript: `function search(nums, target) {\n    let l = 0, r = nums.length - 1;\n    while (l <= r) {\n        const m = (l + r) >>> 1;\n        if (nums[m] === target) return m;\n        nums[m] < target ? l = m + 1 : r = m - 1;\n    }\n    return -1;\n}` },
    testCases: [
      { input: [[-1,0,3,5,9,12], 9], expected: 4 },
      { input: [[-1,0,3,5,9,12], 2], expected: -1 },
    ],
    vizType: 'binarysearch', vizData: [-1,0,3,5,9,12],
    algoSteps: ['l=0, r=nums.length−1','While l ≤ r:','  mid = (l+r) >>> 1','  If nums[mid] === target → return mid','  If nums[mid] < target → l = mid+1','  Else → r = mid−1','Return −1'],
  },

  // ─── SLIDING WINDOW ────────────────────────────────────────────────────────
  {
    id: 11, topic: 'sliding', title: 'Maximum Subarray', difficulty: 'medium', solved: 'none',
    desc: `Given an integer array <code>nums</code>, find the contiguous subarray (at least one element) which has the largest sum and return <em>its sum</em>.<br/><br/>This is the classic <strong>Kadane's Algorithm</strong>.`,
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explain: '[4,−1,2,1] has the largest sum = 6.' },
      { input: 'nums = [1]', output: '1' },
    ],
    constraints: ['1 ≤ nums.length ≤ 10⁵', '−10⁴ ≤ nums[i] ≤ 10⁴'],
    timeComplexity: 'O(n)', spaceComplexity: 'O(1)',
    hints: ['At each index, decide: extend current subarray or start fresh?','cur = max(nums[i], cur + nums[i])','Track global max separately.'],
    starterCode: {
      javascript: `function maxSubArray(nums) {\n    \n};\n`,
      python: `class Solution:\n    def maxSubArray(self, nums: list[int]) -> int:\n        pass\n`,
    },
    solutionCode: { javascript: `function maxSubArray(nums) {\n    let max = nums[0], cur = nums[0];\n    for (let i = 1; i < nums.length; i++) {\n        cur = Math.max(nums[i], cur + nums[i]);\n        max = Math.max(max, cur);\n    }\n    return max;\n}` },
    testCases: [
      { input: [[-2,1,-3,4,-1,2,1,-5,4]], expected: 6 },
      { input: [[1]], expected: 1 },
    ],
    vizType: 'array', vizData: [-2,1,-3,4,-1,2,1,-5,4],
    algoSteps: ['max = cur = nums[0]','For i from 1 to len−1:','  cur = max(nums[i], cur+nums[i])','  max = max(max, cur)','Return max'],
  },
  {
    id: 12, topic: 'sliding', title: 'Longest Substring Without Repeating', difficulty: 'medium', solved: 'none',
    desc: `Given a string <code>s</code>, find the length of the <strong>longest substring</strong> without repeating characters.`,
    examples: [
      { input: 's = "abcabcbb"', output: '3', explain: '"abc" has length 3.' },
      { input: 's = "bbbbb"', output: '1', explain: '"b" has length 1.' },
    ],
    constraints: ['0 ≤ s.length ≤ 5 × 10⁴', 's consists of English letters, digits, symbols and spaces'],
    timeComplexity: 'O(n)', spaceComplexity: 'O(min(m,n))',
    hints: ['Use a sliding window with a Set.','Expand right; when duplicate found, shrink from left.','Track max window size.'],
    starterCode: {
      javascript: `function lengthOfLongestSubstring(s) {\n    \n};\n`,
      python: `class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        pass\n`,
    },
    solutionCode: { javascript: `function lengthOfLongestSubstring(s) {\n    const set = new Set();\n    let l = 0, max = 0;\n    for (let r = 0; r < s.length; r++) {\n        while (set.has(s[r])) set.delete(s[l++]);\n        set.add(s[r]);\n        max = Math.max(max, r - l + 1);\n    }\n    return max;\n}` },
    testCases: [
      { input: ['abcabcbb'], expected: 3 },
      { input: ['bbbbb'], expected: 1 },
    ],
    vizType: 'sort', vizData: [3,1,2,4,5,3,2,6],
    algoSteps: ['Initialize Set, l=0, max=0','For each r from 0 to len−1:','  While s[r] in Set: delete s[l], l++','  Add s[r] to Set','  max = max(max, r−l+1)','Return max'],
  },

  // ─── GRAPHS ────────────────────────────────────────────────────────────────
  {
    id: 13, topic: 'graph', title: 'Number of Islands', difficulty: 'medium', solved: 'none',
    desc: `Given an <code>m × n</code> 2D binary grid, where <code>'1'</code> represents land and <code>'0'</code> represents water, return the <strong>number of islands</strong>.<br/><br/>An island is surrounded by water and formed by connecting adjacent lands horizontally or vertically.`,
    examples: [
      { input: 'grid = [["1","1","0"],["1","1","0"],["0","0","1"]]', output: '2' },
      { input: 'grid = [["1","0","1"],["0","0","0"],["1","0","1"]]', output: '4' },
    ],
    constraints: ['m == grid.length', 'n == grid[i].length', '1 ≤ m, n ≤ 300', 'grid[i][j] is "0" or "1"'],
    timeComplexity: 'O(m×n)', spaceComplexity: 'O(m×n)',
    hints: ['DFS from each unvisited land cell.','Mark visited cells as "0" to avoid re-visiting.','Each DFS invocation = one island.'],
    starterCode: {
      javascript: `function numIslands(grid) {\n    \n};\n`,
      python: `class Solution:\n    def numIslands(self, grid: list[list[str]]) -> int:\n        pass\n`,
    },
    solutionCode: { javascript: `function numIslands(grid) {\n    let count = 0;\n    const dfs = (i, j) => {\n        if (i < 0 || j < 0 || i >= grid.length || j >= grid[0].length || grid[i][j] !== '1') return;\n        grid[i][j] = '0';\n        dfs(i+1,j); dfs(i-1,j); dfs(i,j+1); dfs(i,j-1);\n    };\n    for (let i = 0; i < grid.length; i++)\n        for (let j = 0; j < grid[0].length; j++)\n            if (grid[i][j] === '1') { count++; dfs(i,j); }\n    return count;\n}` },
    testCases: [],
    vizType: 'sort', vizData: [5,3,8,1,9,2],
    algoSteps: ['Scan every cell (i,j)','If cell is "1" → count++, start DFS','DFS: mark cell "0", explore 4 neighbors','Each DFS flood-fills one island','Return count'],
  },

  // ─── LINKED LIST ───────────────────────────────────────────────────────────
  {
    id: 14, topic: 'linked', title: 'Reverse Linked List', difficulty: 'easy', solved: 'none',
    desc: `Given the <code>head</code> of a singly linked list, reverse the list, and return <em>the reversed list</em>.`,
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' },
      { input: 'head = [1,2]', output: '[2,1]' },
    ],
    constraints: ['Number of nodes: [0, 5000]', '−5000 ≤ Node.val ≤ 5000'],
    timeComplexity: 'O(n)', spaceComplexity: 'O(1)',
    hints: ['Use three pointers: prev, curr, next.','At each step, reverse curr.next to point to prev.','Advance all three pointers.'],
    starterCode: {
      javascript: `function reverseList(head) {\n    \n};\n`,
      python: `class Solution:\n    def reverseList(self, head):\n        pass\n`,
    },
    solutionCode: { javascript: `function reverseList(head) {\n    let prev = null, curr = head;\n    while (curr) {\n        const next = curr.next;\n        curr.next = prev;\n        prev = curr;\n        curr = next;\n    }\n    return prev;\n}` },
    testCases: [],
    vizType: 'array', vizData: [1,2,3,4,5],
    algoSteps: ['prev=null, curr=head','While curr not null:','  next = curr.next','  curr.next = prev (reverse link)','  prev = curr; curr = next','Return prev (new head)'],
  },

  // ─── STACK & QUEUE ─────────────────────────────────────────────────────────
  {
    id: 15, topic: 'stack', title: 'Valid Parentheses', difficulty: 'easy', solved: 'none',
    desc: `Given a string <code>s</code> containing just the characters <code>'('</code>, <code>')'</code>, <code>'{'</code>, <code>'}'</code>, <code>'['</code> and <code>']'</code>, determine if the input string is <strong>valid</strong>.<br/><br/>An input string is valid if: open brackets are closed by the same type, and in the correct order.`,
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
    ],
    constraints: ['1 ≤ s.length ≤ 10⁴', 's consists of parentheses only'],
    timeComplexity: 'O(n)', spaceComplexity: 'O(n)',
    hints: ['Use a stack.','Push opening brackets.','On closing bracket, pop and check match.'],
    starterCode: {
      javascript: `function isValid(s) {\n    \n};\n`,
      python: `class Solution:\n    def isValid(self, s: str) -> bool:\n        pass\n`,
    },
    solutionCode: { javascript: `function isValid(s) {\n    const stack = [];\n    const map = { ')': '(', ']': '[', '}': '{' };\n    for (const c of s) {\n        if ('([{'.includes(c)) stack.push(c);\n        else if (stack.pop() !== map[c]) return false;\n    }\n    return stack.length === 0;\n}` },
    testCases: [
      { input: ['()'], expected: true },
      { input: ['()[]{} '], expected: true },
      { input: ['(]'], expected: false },
    ],
    vizType: 'sort', vizData: [3,1,4,1,5,9,2,6],
    algoSteps: ['Create empty stack','For each char c in s:','  If opening → push to stack','  If closing → pop and compare','  If mismatch → return false','Return stack.length === 0'],
  },

  // ─── HEAP ──────────────────────────────────────────────────────────────────
  {
    id: 16, topic: 'heap', title: 'Kth Largest Element', difficulty: 'medium', solved: 'none',
    desc: `Given an integer array <code>nums</code> and an integer <code>k</code>, return the <code>k</code>th largest element in the array.<br/><br/>Note that it is the kth largest element in the sorted order, not the kth distinct element.`,
    examples: [
      { input: 'nums = [3,2,1,5,6,4], k = 2', output: '5' },
      { input: 'nums = [3,2,3,1,2,4,5,5,6], k = 4', output: '4' },
    ],
    constraints: ['1 ≤ k ≤ nums.length ≤ 10⁴', '−10⁴ ≤ nums[i] ≤ 10⁴'],
    timeComplexity: 'O(n log k)', spaceComplexity: 'O(k)',
    hints: ['Sort desc and return nums[k−1] is O(n log n).','A min-heap of size k gives O(n log k).','QuickSelect gives O(n) average.'],
    starterCode: {
      javascript: `function findKthLargest(nums, k) {\n    \n};\n`,
      python: `class Solution:\n    def findKthLargest(self, nums: list[int], k: int) -> int:\n        pass\n`,
    },
    solutionCode: { javascript: `function findKthLargest(nums, k) {\n    nums.sort((a, b) => b - a);\n    return nums[k - 1];\n}` },
    testCases: [
      { input: [[3,2,1,5,6,4], 2], expected: 5 },
      { input: [[3,2,3,1,2,4,5,5,6], 4], expected: 4 },
    ],
    vizType: 'sort', vizData: [3,2,1,5,6,4],
    algoSteps: ['Use a min-heap of size k','For each num in nums:','  Push num onto heap','  If heap.size > k → pop min','Return heap top (kth largest)'],
  },
];
