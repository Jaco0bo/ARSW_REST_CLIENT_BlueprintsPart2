/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package edu.eci.arsw.persistence;

import edu.eci.arsw.blueprints.controllers.BluePrintError;
import edu.eci.arsw.model.Blueprint;
import edu.eci.arsw.model.Point;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;

/**
 *
 * @author hcadavid
 */
public interface BlueprintsPersistence {
    
    /**
     * 
     * @param bp the new blueprint
     * @throws BlueprintPersistenceException if a blueprint with the same name already exists,
     *    or any other low-level persistence error occurs.
     */
    public void saveBlueprint(Blueprint bp) throws BlueprintPersistenceException;

    public void modifyBluePrint(Blueprint bp) throws BlueprintPersistenceException;

    public Set<Blueprint> getAllBlueprints() throws BlueprintPersistenceException;
    
    /**
     * 
     * @param author blueprint's author
     * @param bprintname blueprint's author
     * @return the blueprint of the given name and author
     * @throws BlueprintNotFoundException if there is no such blueprint
     */
    public Blueprint getBlueprint(String author,String bprintname) throws BlueprintNotFoundException;

    /**
     *
     * @param author blueprint's author
     * @return all he blueprints by the same actor
     * @throws BlueprintNotFoundException if there is no such blueprint
     */
    public Set<Blueprint> getBlueprintsByAuthor(String author) throws BlueprintNotFoundException;

    public Blueprint setBlueprint(String author, String name, Point[] puntos) throws BluePrintError;

    public void deleteBlueprint(String author, String name) throws BlueprintNotFoundException;
}
