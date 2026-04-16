package com.cuong.shopbanhang.repository;

import com.cuong.shopbanhang.model.User;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // find user by id
    Optional<User> findByUserId(Long id);

    // find user by email
    Optional<User> findByEmail(String email);

    // check if email exists
    boolean existsByEmail(String email);

    // check if username exists
    boolean existsByUsername(String username);

    boolean existsByPhone(String phone);

    // find user by username
    Optional<User> findByUsername(String username);

    // search users by multiple fields (exclude deleted users)
    @Query("SELECT u FROM User u WHERE " +
            "u.deleted = false AND " +
            "(:search IS NULL OR :search = '' OR " +
            "LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.phone) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.address) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<User> findUsersWithSearch(String search, Pageable pageable);

    // find active user by ID (not deleted)
    Optional<User> findByUserIdAndDeletedFalse(Long id);

    // find active user by email (not deleted)
    Optional<User> findByEmailAndDeletedFalse(String email);

    // find active user by username (not deleted)
    Optional<User> findByUsernameAndDeletedFalse(String username);
}
