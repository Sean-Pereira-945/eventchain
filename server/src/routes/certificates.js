const express = require('express');
const crypto = require('crypto');
const QRCode = require('qrcode');
const User = require('../models/User');
const Event = require('../models/Event');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Simple blockchain simulation
let blockchain = [];

const createBlock = (data, previousHash = '') => {
    const timestamp = new Date().toISOString();
    const blockData = JSON.stringify(data);
    const hash = crypto
        .createHash('sha256')
        .update(previousHash + timestamp + blockData)
        .digest('hex');
    
    return {
        index: blockchain.length,
        timestamp,
        data,
        previousHash,
        hash,
        merkleRoot: crypto.createHash('sha256').update(blockData).digest('hex')
    };
};

// Initialize genesis block
if (blockchain.length === 0) {
    blockchain.push(createBlock({ type: 'genesis', message: 'Genesis Block' }));
}

// @route   POST /api/certificates/issue
// @desc    Issue certificate to attendee
// @access  Private (Organizers only)
router.post('/issue', auth, authorize('organizer', 'admin'), async (req, res) => {
    try {
        const { eventId, attendeeId } = req.body;
        
        if (!eventId || !attendeeId) {
            return res.status(400).json({
                success: false,
                message: 'Event ID and Attendee ID are required'
            });
        }
        
        // Get event and verify organizer
        const event = await Event.findById(eventId).populate('organizer');
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        
        // Verify organizer permission
        if (event.organizer._id.toString() !== req.userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only the event organizer can issue certificates'
            });
        }
        
        // Check if attendee exists and attended
        const attendeeInfo = event.getAttendeeInfo(attendeeId);
        if (!attendeeInfo) {
            return res.status(400).json({
                success: false,
                message: 'User is not registered for this event'
            });
        }
        
        if (!attendeeInfo.attended) {
            return res.status(400).json({
                success: false,
                message: 'User did not attend the event'
            });
        }
        
        if (attendeeInfo.certificateIssued) {
            return res.status(400).json({
                success: false,
                message: 'Certificate already issued to this attendee'
            });
        }
        
        // Create certificate data
        const certificateData = {
            type: 'certificate',
            eventId: event._id,
            eventTitle: event.title,
            attendeeId,
            organizerId: req.userId,
            credits: event.credits,
            issuedAt: new Date().toISOString(),
            uniqueId: crypto.randomBytes(16).toString('hex'),
            attendedAt: attendeeInfo.attendedAt,
            location: event.location.address
        };
        
        // Create new block in blockchain
        const previousBlock = blockchain[blockchain.length - 1];
        const newBlock = createBlock(certificateData, previousBlock.hash);
        blockchain.push(newBlock);
        
        // Update event attendee record
        const attendeeIndex = event.attendees.findIndex(
            a => a.user.toString() === attendeeId.toString()
        );
        event.attendees[attendeeIndex].certificateIssued = true;
        event.attendees[attendeeIndex].certificateHash = newBlock.hash;
        await event.save();
        
        // Update user's certificate collection
        const user = await User.findById(attendeeId);
        user.certificates.push({
            eventId: event._id,
            certificateHash: newBlock.hash,
            credits: event.credits,
            issuedAt: new Date()
        });
        user.totalCredits += event.credits;
        await user.save();
        
        res.json({
            success: true,
            message: 'Certificate issued successfully',
            data: {
                certificateHash: newBlock.hash,
                blockIndex: newBlock.index,
                credits: event.credits,
                certificate: certificateData
            }
        });
        
    } catch (error) {
        console.error('Issue certificate error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error issuing certificate'
        });
    }
});

// @route   GET /api/certificates/verify/:hash
// @desc    Verify certificate by hash
// @access  Public
router.get('/verify/:hash', async (req, res) => {
    try {
        const { hash } = req.params;
        
        // Find block with matching hash
        const block = blockchain.find(b => b.hash === hash);
        
        if (!block) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found in blockchain'
            });
        }
        
        // Verify blockchain integrity up to this block
        let isValid = true;
        let invalidReason = '';
        
        for (let i = 1; i <= block.index; i++) {
            const currentBlock = blockchain[i];
            const previousBlock = blockchain[i - 1];
            
            // Check if previous hash matches
            if (currentBlock.previousHash !== previousBlock.hash) {
                isValid = false;
                invalidReason = 'Blockchain integrity compromised - hash chain broken';
                break;
            }
            
            // Recalculate and verify hash
            const expectedHash = crypto
                .createHash('sha256')
                .update(currentBlock.previousHash + currentBlock.timestamp + JSON.stringify(currentBlock.data))
                .digest('hex');
            
            if (currentBlock.hash !== expectedHash) {
                isValid = false;
                invalidReason = 'Block hash verification failed';
                break;
            }
        }
        
        // Additional verification: check if certificate exists in database
        const user = await User.findOne({
            'certificates.certificateHash': hash
        }).populate('certificates.eventId', 'title organizer');
        
        const dbVerified = !!user;
        
        res.json({
            success: true,
            data: {
                valid: isValid && dbVerified,
                certificate: block.data,
                blockIndex: block.index,
                issuedAt: block.timestamp,
                blockchainVerified: isValid,
                databaseVerified: dbVerified,
                invalidReason: !isValid ? invalidReason : (!dbVerified ? 'Certificate not found in database' : null)
            }
        });
        
    } catch (error) {
        console.error('Verify certificate error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error verifying certificate'
        });
    }
});

// @route   GET /api/certificates/my-certificates
// @desc    Get current user's certificates
// @access  Private
router.get('/my-certificates', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .populate('certificates.eventId', 'title date location organizer')
            .select('certificates totalCredits');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Enhance certificates with blockchain data
        const enhancedCertificates = user.certificates.map(cert => {
            const block = blockchain.find(b => b.hash === cert.certificateHash);
            return {
                ...cert.toObject(),
                blockData: block?.data,
                blockIndex: block?.index,
                verified: !!block,
                blockchainTimestamp: block?.timestamp
            };
        });
        
        res.json({
            success: true,
            data: {
                certificates: enhancedCertificates,
                totalCredits: user.totalCredits,
                certificateCount: user.certificates.length
            }
        });
        
    } catch (error) {
        console.error('Get my certificates error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching certificates'
        });
    }
});

// @route   GET /api/certificates/qr/:hash
// @desc    Generate QR code for certificate
// @access  Public
router.get('/qr/:hash', async (req, res) => {
    try {
        const { hash } = req.params;
        const { size = '200' } = req.query;
        
        // Create verification URL
        const verificationUrl = `${process.env.CLIENT_URL}/verify-certificate/${hash}`;
        
        // Generate QR code
        const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
            width: parseInt(size),
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
        
        res.json({
            success: true,
            data: {
                qrCode: qrCodeDataUrl,
                verificationUrl,
                hash
            }
        });
        
    } catch (error) {
        console.error('Generate QR code error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error generating QR code'
        });
    }
});

// @route   GET /api/certificates/blockchain
// @desc    Get blockchain data (for debugging/transparency)
// @access  Public
router.get('/blockchain', (req, res) => {
    const { limit = 10 } = req.query;
    const limitNum = parseInt(limit);
    
    res.json({
        success: true,
        data: {
            blockchain: blockchain.slice(-limitNum), // Return last N blocks
            totalBlocks: blockchain.length,
            latestBlock: blockchain[blockchain.length - 1]
        }
    });
});

module.exports = router;
