<?php
/**
 * TECH REVIEW — Authentication API
 * Endpoints:
 *   POST /api/auth.php?action=login     — Login
 *   POST /api/auth.php?action=register  — Register
 *   GET  /api/auth.php?action=session   — Get current session user (via token)
 *   POST /api/auth.php?action=logout    — Logout
 */

require_once __DIR__ . '/config.php';

session_start();

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'login':    handleLogin();    break;
    case 'register': handleRegister(); break;
    case 'session':  handleSession();  break;
    case 'logout':   handleLogout();   break;
    default:
        respond(['success' => false, 'message' => 'Unknown action: ' . $action], 400);
}

/* ==========================================
   LOGIN
========================================== */
function handleLogin(): void {
    $body     = getBody();
    $username = trim($body['username'] ?? '');
    $password = $body['password'] ?? '';

    if (empty($username) || empty($password)) {
        respond(['success' => false, 'message' => 'Username and password are required.'], 400);
    }

    $db   = getDB();
    $hash = md5($password);   // MD5 for demo; use password_hash/password_verify in production

    $stmt = $db->prepare(
        'SELECT id, username, name, email, role, avatar FROM users WHERE LOWER(username) = LOWER(?) AND password = ?'
    );
    $stmt->bind_param('ss', $username, $hash);
    $stmt->execute();
    $result = $stmt->get_result();
    $user   = $result->fetch_assoc();
    $stmt->close();
    $db->close();

    if (!$user) {
        respond(['success' => false, 'message' => 'Invalid username or password!'], 401);
    }

    // Store session
    $_SESSION['user'] = $user;

    respond([
        'success' => true,
        'user'    => $user,
        'message' => 'Login successful!'
    ]);
}

/* ==========================================
   REGISTER
========================================== */
function handleRegister(): void {
    $body     = getBody();
    $username = trim($body['username'] ?? '');
    $name     = trim($body['name']     ?? $username);
    $email    = trim($body['email']    ?? '');
    $password = $body['password']      ?? '';
    $role     = in_array($body['role'] ?? '', ['admin', 'user']) ? $body['role'] : 'user';

    if (empty($username) || empty($password)) {
        respond(['success' => false, 'message' => 'Username and password are required.'], 400);
    }

    $db = getDB();

    // Check username uniqueness
    $check = $db->prepare('SELECT id FROM users WHERE LOWER(username) = LOWER(?)');
    $check->bind_param('s', $username);
    $check->execute();
    $check->store_result();
    if ($check->num_rows > 0) {
        $check->close();
        $db->close();
        respond(['success' => false, 'message' => 'Username is already taken!'], 409);
    }
    $check->close();

    $hash   = md5($password);
    $avatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';
    if ($role === 'admin') {
        $avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
    }

    $stmt = $db->prepare(
        'INSERT INTO users (username, name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?, ?)'
    );
    $stmt->bind_param('ssssss', $username, $name, $email, $hash, $role, $avatar);

    if (!$stmt->execute()) {
        $stmt->close();
        $db->close();
        respond(['success' => false, 'message' => 'Registration failed. Please try again.'], 500);
    }

    $newId = $db->insert_id;
    $stmt->close();
    $db->close();

    $user = [
        'id'       => $newId,
        'username' => $username,
        'name'     => $name,
        'email'    => $email,
        'role'     => $role,
        'avatar'   => $avatar
    ];

    $_SESSION['user'] = $user;

    respond([
        'success' => true,
        'user'    => $user,
        'message' => 'Account created successfully!'
    ]);
}

/* ==========================================
   SESSION CHECK
========================================== */
function handleSession(): void {
    if (!empty($_SESSION['user'])) {
        respond(['success' => true, 'user' => $_SESSION['user']]);
    } else {
        respond(['success' => false, 'user' => null, 'message' => 'Not logged in.'], 401);
    }
}

/* ==========================================
   LOGOUT
========================================== */
function handleLogout(): void {
    session_destroy();
    respond(['success' => true, 'message' => 'Logged out successfully.']);
}
