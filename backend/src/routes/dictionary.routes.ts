import { Router } from 'express';
import { lookup, getEntry } from '../controllers/dictionary.controller';

const router = Router();

/**
 * @route   GET /api/dictionary/lookup
 * @desc    Lookup dictionary entries by character (auto-suggest)
 * @query   character - The character(s) to search for
 * @query   variant - "simplified" or "traditional" (default: "simplified")
 * @access  Public
 */
router.get('/lookup', lookup);

/**
 * @route   GET /api/dictionary/entry/:id
 * @desc    Get a single dictionary entry by ID
 * @access  Public
 */
router.get('/entry/:id', getEntry);

export default router;
