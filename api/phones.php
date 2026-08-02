<?php
/**
 * TECH REVIEW — Phones CRUD API
 * Endpoints:
 *   GET    /api/phones.php              — Get all phones (with specs)
 *   GET    /api/phones.php?id=xxx       — Get single phone by id
 *   POST   /api/phones.php              — Create new phone (Admin only)
 *   PUT    /api/phones.php?id=xxx       — Update phone (Admin only)
 *   DELETE /api/phones.php?id=xxx       — Delete phone (Admin only)
 */

require_once __DIR__ . '/config.php';

session_start();

$method = $_SERVER['REQUEST_METHOD'];
$id     = $_GET['id'] ?? '';

switch ($method) {
    case 'GET':    $id ? getPhone($id) : getAllPhones(); break;
    case 'POST':   createPhone();                        break;
    case 'PUT':    updatePhone($id);                     break;
    case 'DELETE': deletePhone($id);                     break;
    default:
        respond(['success' => false, 'message' => 'Method not allowed.'], 405);
}

/* ==========================================
   GET ALL PHONES
========================================== */
function getAllPhones(): void {
    $db     = getDB();
    $phones = [];

    // Fetch phones
    $res = $db->query('SELECT * FROM phones ORDER BY created_at DESC');
    while ($row = $res->fetch_assoc()) {
        $phones[$row['id']] = formatPhone($row);
    }
    $res->free();

    // Fetch all specs in one query and attach
    $specRes = $db->query('SELECT * FROM phone_specs');
    while ($spec = $specRes->fetch_assoc()) {
        $pid = $spec['phone_id'];
        $cat = $spec['category'];
        $key = $spec['spec_key'];
        $val = $spec['spec_value'];
        if (isset($phones[$pid])) {
            $phones[$pid]['specs'][$cat][$key] = $val;
        }
    }
    $specRes->free();
    $db->close();

    respond(['success' => true, 'phones' => array_values($phones)]);
}

/* ==========================================
   GET SINGLE PHONE
========================================== */
function getPhone(string $id): void {
    $db   = getDB();
    $stmt = $db->prepare('SELECT * FROM phones WHERE id = ?');
    $stmt->bind_param('s', $id);
    $stmt->execute();
    $row  = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$row) {
        $db->close();
        respond(['success' => false, 'message' => 'Phone not found.'], 404);
    }

    $phone = formatPhone($row);

    // Fetch specs
    $stmt2 = $db->prepare('SELECT * FROM phone_specs WHERE phone_id = ?');
    $stmt2->bind_param('s', $id);
    $stmt2->execute();
    $specRes = $stmt2->get_result();
    while ($spec = $specRes->fetch_assoc()) {
        $phone['specs'][$spec['category']][$spec['spec_key']] = $spec['spec_value'];
    }
    $stmt2->close();
    $db->close();

    respond(['success' => true, 'phone' => $phone]);
}

/* ==========================================
   CREATE PHONE (Admin only)
========================================== */
function createPhone(): void {
    requireAdmin();
    $body  = getBody();
    $phone = validatePhoneBody($body);

    if (empty($phone['brand']) || empty($phone['model'])) {
        respond(['success' => false, 'message' => 'Brand and Model are required.'], 400);
    }

    $id = 'phone-' . strtolower(str_replace(' ', '-', $phone['brand'])) . '-' . time();

    $db   = getDB();
    $stmt = $db->prepare(
        'INSERT INTO phones (id, brand, model, release_date, status, price, image, youtube_url, youtube_id, rating, views)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 4.5, 0)'
    );
    $stmt->bind_param(
        'sssssssss',
        $id,
        $phone['brand'],
        $phone['model'],
        $phone['releaseDate'],
        $phone['status'],
        $phone['price'],
        $phone['image'],
        $phone['youtubeUrl'],
        $phone['youtubeId']
    );

    if (!$stmt->execute()) {
        $stmt->close(); $db->close();
        respond(['success' => false, 'message' => 'Failed to insert phone.'], 500);
    }
    $stmt->close();

    saveSpecs($db, $id, $phone['specs'] ?? []);
    $db->close();

    respond(['success' => true, 'id' => $id, 'message' => 'Phone added to Tech Review database!']);
}

/* ==========================================
   UPDATE PHONE (Admin only)
========================================== */
function updatePhone(string $id): void {
    requireAdmin();
    if (empty($id)) respond(['success' => false, 'message' => 'Phone ID is required.'], 400);

    $body  = getBody();
    $phone = validatePhoneBody($body);

    $db   = getDB();
    $stmt = $db->prepare(
        'UPDATE phones SET brand=?, model=?, release_date=?, status=?, price=?, image=?, youtube_url=?, youtube_id=?
         WHERE id=?'
    );
    $stmt->bind_param(
        'sssssssss',
        $phone['brand'],
        $phone['model'],
        $phone['releaseDate'],
        $phone['status'],
        $phone['price'],
        $phone['image'],
        $phone['youtubeUrl'],
        $phone['youtubeId'],
        $id
    );

    if (!$stmt->execute()) {
        $stmt->close(); $db->close();
        respond(['success' => false, 'message' => 'Update failed.'], 500);
    }
    $stmt->close();

    // Re-insert specs (delete old first)
    $del = $db->prepare('DELETE FROM phone_specs WHERE phone_id = ?');
    $del->bind_param('s', $id);
    $del->execute();
    $del->close();

    saveSpecs($db, $id, $phone['specs'] ?? []);
    $db->close();

    respond(['success' => true, 'message' => 'Phone specs updated successfully!']);
}

/* ==========================================
   DELETE PHONE (Admin only)
========================================== */
function deletePhone(string $id): void {
    requireAdmin();
    if (empty($id)) respond(['success' => false, 'message' => 'Phone ID is required.'], 400);

    $db   = getDB();
    $stmt = $db->prepare('DELETE FROM phones WHERE id = ?');
    $stmt->bind_param('s', $id);
    $stmt->execute();
    $affected = $stmt->affected_rows;
    $stmt->close();
    $db->close();

    if ($affected === 0) {
        respond(['success' => false, 'message' => 'Phone not found.'], 404);
    }

    respond(['success' => true, 'message' => 'Phone deleted from Tech Review database.']);
}

/* ==========================================
   HELPERS
========================================== */
function requireAdmin(): void {
    if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
        respond(['success' => false, 'message' => 'Admin privileges required.'], 403);
    }
}

function validatePhoneBody(array $body): array {
    $youtubeUrl = trim($body['youtubeUrl'] ?? '');
    $youtubeId  = extractYouTubeId($youtubeUrl);
    if (empty($youtubeId)) {
        $youtubeId = extractYouTubeId($body['youtubeId'] ?? '');
    }

    return [
        'brand'       => trim($body['brand']       ?? ''),
        'model'       => trim($body['model']        ?? ''),
        'releaseDate' => trim($body['releaseDate']  ?? ''),
        'status'      => trim($body['status']       ?? ''),
        'price'       => trim($body['price']        ?? ''),
        'image'       => trim($body['image']        ?? ''),
        'youtubeUrl'  => $youtubeUrl,
        'youtubeId'   => $youtubeId,
        'specs'       => $body['specs']             ?? []
    ];
}

function saveSpecs(mysqli $db, string $phoneId, array $specs): void {
    if (empty($specs)) return;

    $stmt = $db->prepare(
        'INSERT INTO phone_specs (phone_id, category, spec_key, spec_value) VALUES (?, ?, ?, ?)'
    );

    foreach ($specs as $category => $fields) {
        if (!is_array($fields)) continue;
        foreach ($fields as $key => $value) {
            $value = (string)($value ?? '');
            if ($value === '') continue;
            $stmt->bind_param('ssss', $phoneId, $category, $key, $value);
            $stmt->execute();
        }
    }
    $stmt->close();
}

/**
 * Convert snake_case DB row to camelCase JS-compatible format.
 */
function formatPhone(array $row): array {
    return [
        'id'          => $row['id'],
        'brand'       => $row['brand'],
        'model'       => $row['model'],
        'releaseDate' => $row['release_date'],
        'status'      => $row['status'],
        'price'       => $row['price'],
        'image'       => $row['image'],
        'youtubeUrl'  => $row['youtube_url'],
        'youtubeId'   => $row['youtube_id'],
        'rating'      => (float)$row['rating'],
        'views'       => (int)$row['views'],
        'specs'       => []          // populated after spec fetch
    ];
}
