<?php

namespace Leadin\auth;

use Leadin\data\Portal_Options;

/**
 * Encrypting/decrypting OAuth credentials
 * Adapted from https://felix-arntz.me/blog/storing-confidential-data-in-wordpress/
 */
class OAuthCrypto {

	/**
	 * Return the key to use in encrypting/decrypting OAuth credentials
	 */
	private static function get_key() {
		if ( defined( 'LOGGED_IN_KEY' ) ) {
			return LOGGED_IN_KEY;
		}

		return '';
	}

	/**
	 * Return the salt to use in encrypting/decrypting OAuth credentials
	 */
	private static function get_salt() {
		if ( defined( 'LOGGED_IN_SALT' ) ) {
			return LOGGED_IN_SALT;
		}

		return '';
	}

	/**
	 * Given a value, encrypt it if the openssl extension is loaded and we have a valid key/salt
	 *
	 * @param string $value Value to encrypt.
	 *
	 * @return string Encrypted value
	 */
	public static function encrypt( $value ) {
		if ( ! extension_loaded( 'openssl' ) ) {
			Portal_Options::set_encryption_error( 'Error: OpenSSL extension not loaded' );
			return $value;
		}

		if ( empty( self::get_key() ) ) {
			Portal_Options::set_encryption_error( 'Error: Encryption key is missing' );
			return $value;
		}

		if ( empty( self::get_salt() ) ) {
			Portal_Options::set_encryption_error( 'Error: Encryption salt is missing' );
			return $value;
		}

		$method             = 'aes-256-ctr';
		$init_vector_length = openssl_cipher_iv_length( $method );
		$init_vector        = openssl_random_pseudo_bytes( $init_vector_length );

		if ( false === $init_vector ) {
			return 'Error: Failed to generate initialization vector';
		}

		$raw_value = openssl_encrypt( $value . self::get_salt(), $method, self::get_key(), 0, $init_vector );
		if ( ! $raw_value ) {
			Portal_Options::set_encryption_error( 'Error: Encryption failed' );
			return false;
		}

		// phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode
		return base64_encode( $init_vector . $raw_value );
	}

	/**
	 * Decrpyt a given value
	 *
	 * @param string $value the encrypted value to decrypt.
	 *
	 * @return string The decrypted value
	 */
	public static function decrypt( $value ) {
		if ( ! extension_loaded( 'openssl' ) ) {
			return 'Error: OpenSSL extension not loaded';
		}

		if ( empty( self::get_key() ) ) {
			return 'Error: Encryption key is missing';
		}

		if ( empty( self::get_salt() ) ) {
			return 'Error: Encryption salt is missing';
		}

		// phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode
		$raw_value = base64_decode( $value, true );
		if ( false === $raw_value ) {
				return 'Error: Base64 decoding failed';
		}

		$method             = 'aes-256-ctr';
		$init_vector_length = openssl_cipher_iv_length( $method );
		$init_vector        = substr( $raw_value, 0, $init_vector_length );
		$encrypted_data     = substr( $raw_value, $init_vector_length );

		if ( false === $init_vector || false === $encrypted_data ) {
				return 'Error: Failed to extract IV or encrypted data';
		}

		$decrypted_value = openssl_decrypt( $encrypted_data, $method, self::get_key(), 0, $init_vector );
		if ( false === $decrypted_value ) {
				return 'Error: Decryption failed';
		}

		if ( self::get_salt() !== substr( $decrypted_value, -strlen( self::get_salt() ) ) ) {
				return 'Error: Salt verification failed';
		}

		return substr( $decrypted_value, 0, -strlen( self::get_salt() ) );
	}
}
